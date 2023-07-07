const child_process = require('child_process');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** 获取 git 版本信息 */
const getGitInfo = () => {
	try {
		const version = child_process.execSync('git branch --v', {
			encoding: 'utf8'
		});
		return version.replace('\n', '').slice(1)
	} catch (error) {
		return null
	}
}

class WebpackBuildInfo {

	constructor(options = {}) {
		this.options = options
	}

	apply(compiler) {

		const { format, scriptId = "webpack-build-info" } = this.options
		const gitInfo = getGitInfo()

		/** 构建开始时间 */
		const startTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`

		compiler.hooks.compilation.tap('WebpackBuildInfo', compilation => {

			HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('WebpackBuildInfo', (data, cb) => {
				let script = ''
				if (gitInfo) {
					script += `console.log("%c版本信息", "color: #1677ff; text-decoration: underline;font-weight: 900;", '${gitInfo}');`
				}
				script += `console.log("%c构建开始时间", "color: #52c41a; text-decoration: underline;font-weight: 900;", '${startTime}');`

				/** 构建结束时间 */
				const endTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
				script += `console.log("%c构建结束时间", "color: #13c2c2; text-decoration: underline;font-weight: 900;", '${endTime}');`

				/** 自定义日志格式 */
				if (format) {
					script = formatLog({
						gitInfo,
						startTime,
						endTime,
					})
				}

				// 修改 HTML 内容
				data.html += `<script id='${scriptId}'>${script}</script>`;
				cb(null, data);
			});
		})
	}
}

module.exports = WebpackBuildInfo