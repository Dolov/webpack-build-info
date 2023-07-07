const child_process = require('child_process');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PLUGIN_NAME = 'WebpackBuildInfo'
const DEFAULT_SCRIPT_ID = 'webpack-build-info'

const NAME_STYLE = "background:#35495e; padding: 2px 5px;  color: #fff"
const VALUE_STYLE = "background:#41b883; padding: 2px 5px;  color: #fff"

/** 获取 git 版本信息 */
const getGitInfo = () => {
	try {
		const version = child_process.execSync('git branch --v', {
			encoding: 'utf8'
		});
		return version.replace('\n', '').slice(2)
	} catch (error) {
		return null
	}
}

/** 输出带有样式的 log */
const styleLog = (...args) => {
	const { values, styles } = args.reduce((previousValue, currentValue) => {
		let item = currentValue
		if (typeof currentValue === 'string') {
			item = {
				value: currentValue,
				style: ""
			}
		}
		const { value, style } = item
		previousValue.values.push(value)
		previousValue.styles.push(`"${style}"`)
		return previousValue
	}, { values: [], styles: [] })
	const valueStr = values.map(item => `%c${item}`).join('')
	const styleStr = styles.join()
	return `console.log('${valueStr}', ${styleStr});\n`
}


class WebpackBuildInfo {

	constructor(options = {}) {
		this.options = options
	}

	apply(compiler) {

		const gitInfo = getGitInfo()
		const { format, scriptId = DEFAULT_SCRIPT_ID, trigger, extraParams } = this.options

		/** 构建开始时间 */
		const startTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`

		compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {

			HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(PLUGIN_NAME, (data, cb) => {
				let script = ''
				if (gitInfo) {

					/** 输出版本信息 */
					script += styleLog(
						{ value: "版本信息", style: NAME_STYLE },
						{ value: gitInfo, style: VALUE_STYLE },
					)
				}

				/** 输出构建开始时间 */
				script += styleLog(
					{ value: "构建开始时间", style: NAME_STYLE },
					{ value: startTime, style: VALUE_STYLE },
				)

				/** 输出构建结束时间 */
				const endTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
				script += styleLog(
					{ value: "构建结束时间", style: NAME_STYLE },
					{ value: endTime, style: VALUE_STYLE },
				)

				/** 自定义参数 */
				if (Array.isArray(extraParams)) {
					extraParams.forEach(item => {
						const { name, value, nameStyle = NAME_STYLE, valueStyle = VALUE_STYLE } = item
						script += styleLog(
							{ value: name, style: nameStyle },
							{ value: value, style: valueStyle },
						)
					})
				}

				/** 自定义日志格式 */
				if (format) {
					script = formatLog({
						gitInfo,
						endTime,
						startTime,
						extraParams,
					})
				}

				/** 在控制台输入指定变量后再输出构建信息 */
				if (trigger) {
					script = `
						Object.defineProperty(window, '${trigger}', {
							get() {
								${script}
							}
						})
					`
				}

				// 修改 HTML 内容
				data.html += `<script id='${scriptId}'>${script}</script>`;
				cb(null, data);
			});
		})
	}
}

module.exports = WebpackBuildInfo