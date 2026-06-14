import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class CodechefService {
  async getUserData(handle: string) {
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      await page.goto(`https://www.codechef.com/users/${handle}`, {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });

      // Extract rating
      let rating: string | null = null;

      try {
        await page.waitForSelector('.rating-number', {
          timeout: 10000,
        });

        rating = await page.$eval('.rating-number', (el) => {
          const text = el.textContent?.trim() || '';
          const match = text.match(/\d+/);
          return match ? match[0] : null;
        });
      } catch {
        console.log('Rating selector not found');
      }

      // Extract max rating / star / rank if available
      let maxRating: string | null = null;
      let stars: string | null = null;

      try {
        maxRating = await page.$eval('.rating-number', (el) => {
          const container = el.closest('.rating-header');
          const text = container?.textContent || '';
          const match = text.match(/Highest Rating[^\d]*(\d+)/i);
          return match ? match[1] : null;
        });
      } catch {
        // ignore if not found
      }

      try {
        stars = await page.$eval('.rating', (el) => el.textContent?.trim() || '');
      } catch {
        // ignore
      }

      const ratingHistory: any[] = [];
      let submissions: any[] = [];

      try {
        const submissionsPage = await browser.newPage();

        await submissionsPage.goto(
          `https://www.codechef.com/recent/user?user_handle=${handle}`,
          {
            waitUntil: 'networkidle2',
          },
        );

        const rawText = await submissionsPage.evaluate(
          () => document.body.textContent || '',
        );

        const cleanedText = rawText.trim();

        let parsed: any;

        try {
          parsed = JSON.parse(cleanedText);
        } catch (err) {
          console.error('Failed to parse CodeChef recent submissions response');
          throw err;
        }

        const htmlContent = String(parsed.content);

        const submissionRegex =
          /(\d{2}:\d{2}\s(?:AM|PM)\s\d{2}\/\d{2}\/\d{2})[\s\S]*?<\/span>\s*<\/span>\s*<\/td>.*?>([A-Z0-9_]+)<\/a><\/td>(.*?)<\/td>(C\+\+|JAVA|PYTHON|PYTH|KOTLIN|C)<\/td>/gi;

        let match;
        const rawSubmissions: any[] = [];

        while ((match = submissionRegex.exec(htmlContent)) !== null) {
          const rawVerdict = match[3]?.replace(/<[^>]*>/g, '').trim() || '';

          let verdict = 'Unknown';

          if (rawVerdict.includes('(100)')) {
            verdict = 'Accepted';
          } else if (rawVerdict.toLowerCase().includes('wrong')) {
            verdict = 'Wrong Answer';
          } else if (rawVerdict.toLowerCase().includes('time')) {
            verdict = 'Time Limit Exceeded';
          } else if (rawVerdict.toLowerCase().includes('runtime')) {
            verdict = 'Runtime Error';
          } else if (rawVerdict.length > 0) {
            verdict = rawVerdict;
          }

          rawSubmissions.push({
            time: match[1]?.trim() || '-',
            problemName: match[2]?.trim() || 'Unknown Problem',
            verdict,
            language: match[4]?.trim() || '-',
          });
        }

        const filtered = rawSubmissions.filter(
          (s) => s.problemName && s.problemName !== 'View',
        );

        const seen = new Set<string>();

        submissions = filtered.filter((s) => {
          const key = `${s.time}-${s.problemName}-${s.language}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        submissions = submissions.slice(0, 20);

        await submissionsPage.close();
      } catch (error) {
        console.log('Could not fetch CodeChef submissions', error);
      }

      return {
        success: true,
        user: {
          ccHandle: handle,
          cfCurrentRating: rating ? parseInt(rating, 10) : 0,
          cfMaxRating: maxRating ? parseInt(maxRating, 10) : 0,
          cfRank: stars || 'Unrated',
        },
        ratingHistory,
        submissions,
      };
    } catch (error: any) {
      console.error('CODECHEF ERROR:', error?.message || error);

      return {
        success: false,
        message: 'Failed to fetch CodeChef data',
        user: null,
        ratingHistory: [],
        submissions: [],
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}