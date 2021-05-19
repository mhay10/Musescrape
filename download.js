import axios from "axios";
import path from "path";
import fs from "fs";

/**
 * @param {string[]} page_urls
 * @param {string} output_dir
 */

export const download_pages = (page_urls, output_dir) => {
	if (fs.existsSync(output_dir)) {
		const files = fs.readdirSync(output_dir);
		files.map((file) => {
			file = path.join(output_dir, file);
			if (fs.statSync(file).isDirectory()) {
				fs.rmSync(file, { recursive: true, force: true });
			} else {
				fs.unlinkSync(file, { force: true });
			}
		});
	} else {
		fs.mkdirSync(output_dir);
	}

	return page_urls.map(async (url, i) => {
		const filetype = url.includes(".svg") ? "svg" : "png";

		const res = await axios.get(url);
		console.log(`Downloading page ${i + 1} of ${page_urls.length}`);
		console.log(res.data);
		const page = fs.createWriteStream(
			`${output_dir}/page_${i + 1}.${filetype}`
		);
		page.write(res.data);
		page.end();
	});
};
