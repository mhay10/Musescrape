import { createRequire } from "module";
import { remote } from "webdriverio";
import { download_pages } from "./download.js";
import { convert_to_png, pngs_to_pdf, remove_svg_files } from "./convert.js";
import fg from "fast-glob";

const require = createRequire(import.meta.url);
const sync = require("@wdio/sync").default;
const prompt = require("prompt-sync")({ sigint: true });

/**
 * @param {Number} millis
 */

const sleep = (millis) => {
	const date = Date.now();
	let current_date = null;
	while (current_date - date < millis) current_date = Date.now();
};

remote({
	capabilities: {
		browserName: "chrome",
		"goog:chromeOptions": {
			args: ["--headless", "--disable-gpu"],
		},
	},
}).then((driver) =>
	sync(async () => {
		const score_url = prompt("Musescore URL: ");
		driver.url(score_url);

		let page_urls = [];
		let pages = driver.$$('[class="vAVs3"]')
		for (let page of pages) {
			page.click();
			sleep(1500);

			let page_url = page.$('[class="_2_Ppp"]').getAttribute("src");
			page_urls.push(page_url);
		};

		await Promise.all(download_pages(page_urls, "./pages"));
		sleep(500);

		const svg_files = await fg("./pages/*.svg");
		console.log(svg_files);
		if (svg_files.length > 0) {
			svg_files.forEach((image_file) => {
				console.log(`Converting ${image_file} to PNG file`);
				convert_to_png(image_file);
			});
		}

		sleep(100);
		remove_svg_files(svg_files);

		const score_title = (await driver.getTitle())
			.replace("Sheet music for Piano (Solo) | Musescore.com", "")
			.trim();

		const png_files = await fg("./pages/*.png");
		if (png_files.length > 0) {
			pngs_to_pdf(png_files, "./pdf", score_title);
		}

		driver.deleteSession();
	}).catch((err) => {
		throw err;
	})
);
