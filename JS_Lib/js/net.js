/**
 * 封装的ajax请求，优化请求发送，超时自动重发机制<br/>
 * 默认重发次数为0，即仅发送一次请求<br/>
 * 若设置了重发次数，默认超时时间为10s，否则，默认不限超时时间<br/>
 * 
 * @param {String} url 请求地址
 * @param {Boolean} async 异步
 * @param {JSON} data 请求参数
 * @param {Function} callBack 回调
 * @param {Number} retry 请求失败重试次数
 * @param {Number} timeout 超时时间
 */
var netRequest = function(url, async, data, callBack, retry, timeout) {

	this.url = url || '';
	this.async = async || true;
	this.data = {} || data;
	this.retry = retry;
	this.timeout = timeout;
	this.callback = callBack;
	console.log('url = ' + url + ', async = ' + async + ', data = ' + data + ', retry = ' + retry + ', timeout = ' + timeout)

	//init the parmas
	this.init = function() {
		if (typeof(this.timeout) == undefined || this.timeout == null) { // not set timeout
			if (typeof(this.retry) == undefined || this.retry == null) { // not set retry times, default 0.
				this.retry = 0;
			} else { // has set retry times
				this.to = 10000;
			}
		} else { // has set timeout
			if (typeof(this.retry) == undefined || this.retry == null) // not set retry times, default 0.
				this.retry = 0;
			// calculate the timeout for every ajax request.
			this.to = this.timeout / (this.retry + 1);
		}
		this.tryTimes = 0; // ajax request total times.
		console.log("init: " + ', retry = ' + this.retry + ', to = ' + this.to);
	}

	/**
	 * send ajax request
	 * @param {String} requestType request type, default "get".
	 */
	this.request = function(requestType) {
		requestType = requestType || "get";
		$.ajax({
			type: requestType,
			url: this.url,
			async: this.async,
			dataType: "json",
			data: this.data,
			timeout: this.to,
			success: function(suceess) {
				if (typeof(this.callBack) != undefined && this.callBack != null) {
					this.callBack(true, suceess);
				}
			},
			error: function(xhr, error, exception) {
				if (error == 'timeout') {
					this.tryTimes++;
					if (this.tryTimes < this.retry + 1) {
						this.request();
					} else {
						if (typeof(this.callBack) != undefined && this.callBack != null) {
							this.callBack(false, error, exception);
						}
					}
				} else {
					if (typeof(this.callBack) != undefined && this.callBack != null) {
						this.callBack(false, error, exception);
					}
				}
			}
		});
	}
	this.init();

	/**
	 * send get request.
	 */
	this.get = function() {

		this.request("get");
	}

	/**
	 * send post request.
	 */
	this.post = function() {
		this.reuest("post");
	}
}

/**
 * pre-load images
 * @param {Array} arr the images' src
 */
function preloadImages(arr) {
	var newimages = [],
		loadedimages = 0;
	var postAction = function() {}
	var arr = (typeof arr != "object") ? [arr] : arr;

	function imageLoadPost() {
		loadedimages++;
		if (loadedimages == arr.length) {
			postAction(newimages);
		}
	}
	for (var i = 0; i < arr.length; i++) {
		newimages[i] = new Image();
		newimages[i].src = arr[i];
		newimages[i].onload = function() {
			imageLoadPost();
		}
		newimages[i].onerror = function() {
			imageLoadPost();
		}
	}
	return {
		done: function(f) {
			postAction = f || postAction;
		}
	}
}

/**
 * sort params by dictionary order.
 * @param {Array} params param arrays of "{key: value}" structure
 * @return {JSON} sorted json params
 */
function sortParams(params) {
	if (typeof(params) == "undefined" || params == null || !(array instanceof Array))
		return;
	params.sort(function(a, b) {
		return a.key.localeCompare(b.key);
	});
	var paramStr = '{';
	for (var i = 0; i < params.length; i++) {
		var key = params[i].key;
		paramStr += "\"" +params[i].key + '\":' + params[i].value + ",";
	}
	paramStr = paramStr.substr(0, paramStr.length-1) + '}';
	console.log(paramStr);
	return jQuery.parseJSON(paramStr);
}