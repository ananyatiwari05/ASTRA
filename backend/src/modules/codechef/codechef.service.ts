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
      waitUntil: 'networkidle2',
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

    await browser.close();

    return {
      user: {
        handle,
        rating: rating ? parseInt(rating, 10) : null,
      },
      ratings: [],
      submissions: [],
    };
  }
}
