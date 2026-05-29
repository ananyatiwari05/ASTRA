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

    // Extract rating
    const rating = await page.$eval(
      '.rating-number',
      (el) => el.textContent
    );

    await browser.close();

    return {
      handle,
      rating,
    };
  }
}