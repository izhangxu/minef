/**
 * 工具函数集合
 * @type {Object}
 */
module.exports = {
	trim: function(str) {
		return str.replace(/(^\s*)|(\s*$)/g, '');
	}
};