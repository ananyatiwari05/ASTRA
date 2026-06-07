import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class CodechefService {
  async getUserData(handle: string) {
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.goto(`https://www.codechef.com/users/${handle}`, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    const title = await page.title();
    console.log('CodeChef page title:', title);

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

    console.log('CodeChef rating:', rating);

    const ratings: any[] = [];

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

      console.log('CodeChef response preview:', cleanedText.substring(0, 300));

      let parsed: any;

      try {
        parsed = JSON.parse(cleanedText);
      } catch (err) {
        console.error('Failed to parse CodeChef response');
        console.error(cleanedText.substring(0, 1000));
        throw err;
      }

      const htmlContent = String(parsed.content);

      submissions = [];

      const submissionRegex = /(\d{2}:\d{2}\s(?:AM|PM)\s\d{2}\/\d{2}\/\d{2})[\s\S]*?<\/span>\s*<\/span>\s*<\/td>([A-Z0-9_]+)<\/a><\/td>(.*?)<\/td>(C\+\+|JAVA|PYTHON|PYTH|KOTLIN|C)<\/td>/gi;

      let match;

      while ((match = submissionRegex.exec(htmlContent)) !== null) {
        const rawVerdict = match[3]?.replace(/<[^>]*>/g, '').trim() || '';

        let verdict = 'Unknown';

        if (rawVerdict.includes('(100)')) {
          verdict = 'Accepted';
        } else if (rawVerdict.includes('wrong')) {
          verdict = 'Wrong Answer';
        } else if (rawVerdict.includes('time')) {
          verdict = 'Time Limit Exceeded';
        } else if (rawVerdict.includes('runtime')) {
          verdict = 'Runtime Error';
        } else if (rawVerdict.length > 0) {
          verdict = rawVerdict;
        }

        submissions.push({
          time: match[1]?.trim() || '',
          problem: match[2]?.trim() || '',
          verdict,
          language: match[4]?.trim() || '',
        });
      }

      console.log('Regex matches found:', submissions.length);

      submissions = submissions.filter(
        (s) => s.problem && s.problem !== 'View',
      );

      const seen = new Set<string>();

      submissions = submissions.filter((s) => {
        const key = `${s.time}-${s.problem}-${s.language}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });

      submissions = submissions.slice(0, 20);

      if (submissions.length === 0) {
        console.log('FIRST 2000 CHARS OF CONTENT');
        console.log(htmlContent.substring(0, 2000));
      } else {
        console.log('FIRST SUBMISSION:', submissions[0]);
      }

      await submissionsPage.close();
    } catch (error) {
      console.log('Could not fetch CodeChef submissions', error);
    }

    await browser.close();

    return {
      user: {
        handle,
        rating: rating ? parseInt(rating, 10) : null,
      },
      ratings,
      submissions,
    };
  }
}
