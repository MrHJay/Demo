/**
 * 获取手机的平台类型
 *
 * @returns {Number} 1：Android 2：IOS 3：Windows Phone -1：其他
 */
function getPlatform() {
	var ua = navigator.userAgent.toLowerCase();
	//    console.info("userAgent = " + ua);
	if (/android/.test(ua)) {
		return 1;
	} else if (/iphone|ipod|ipad/.test(ua)) {
		return 2;
	} else if (/windows phone/.test(ua)) {
		return 3;
	} else {
		return -1;
	}
}

/**
 * add format method for the Date object.
 * @param {Object} format the pattern
 */
Date.prototype.format = function(format) {
	/* 
	 * eg:format="yyyy-MM-dd hh:mm:ss"; 
	 */
	var o = {
		"M+": this.getMonth() + 1, // month  
		"d+": this.getDate(), // day  
		"h+": this.getHours(), // hour  
		"m+": this.getMinutes(), // minute  
		"s+": this.getSeconds(), // second  
		"q+": Math.floor((this.getMonth() + 3) / 3), // quarter  
		"S": this.getMilliseconds()
			// millisecond  
	}
	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
}

/**
 * add a javascript to document.
 * @param {String} src the path of the javascript
 * @param {Function} onloadFun onload function of the script
 */
function addJavascript(src, onloadFun) {
	// TODO script exist?
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = src;
	if (typeof(onloadFun) != "undefined" && onloadFun != null)
		script.onload = onloadFun;
	document.body.appendChild(script);
}

/**
 * 检查手机号输入是否合法
 *
 * @param number
 *            手机号
 * @returns 是否合法
 */
function isPhone(number) {
	var re = /^(0|\+86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
	return re.test(number);
}