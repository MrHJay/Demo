var ios = {};

function clickLottery() {
	loading(true);
	$("#lottery_btn").addClass("ui-state-disabled");
	getPrizeValidity(function(a, b) {
		loading(false);
		$("#lottery_btn").removeClass("ui-state-disabled");
		if (!a) {
			showToast("#ui-toast", b);
			return
		} else {
			if (a.status == 1) {
				showToast("#ui-toast", "活动暂未开始，敬请期待！");
				return
			} else {
				if (a.status == 3) {
					showToast("#ui-toast", "您来晚了，活动已结束了哦~");
					return
				}
			}
		}
		if (at_app) {
			getSourceType(function(c) {
				onEvent("101", "510" + c)
			});
			if (platfrom == 1) {
				if (isLogin()) {
					isGetPrize()
				} else {
					doNavLogin("登录后才可以抽奖哦~")
				}
			} else {
				if (platfrom == 2) {
					ios_bridge.callHandler("isUserLogin", null, function(c) {
						if (c != "false") {
							ios_info = {};
							ios_bridge.callHandler("getDeviceInfo", {}, function(d) {
								d = jQuery.parseJSON(d);
								ios_info.duid = d.duid;
								ios_info.appid = d.appid;
								ios_info.apptype = d.apptype;
								ios_info.appver = d.appver;
								ios_info.business = d.business;
								ios_info.cid = d.cid;
								ios_bridge.callHandler("getUserInfo", {}, function(e) {
									e = jQuery.parseJSON(e);
									ios_info.userid = e.userid;
									ios_info.session = e.session;
									ios_info.username = e.username;
									isGetPrize()
								})
							})
						} else {
							doNavLogin("登录后才可以抽奖哦~")
						}
					})
				}
			}
		} else {
			if (atWeixin()) {
				toGuide()
			} else {
				startApp()
			}
		}
	})
}

function isGetPrize() {
	loading(true);
	$("#lottery_btn").addClass("ui-state-disabled");
	chkPrize(function(a, b) {
		loading(false);
		$("#lottery_btn").removeClass("ui-state-disabled");
		if (!a) {
			showToast("#ui-toast", b)
		} else {
			if (!a.duid_result) {
				gotDevPrizeTip()
			} else {
				if (!a.kuid_result) {
					gotUserPrizeTip()
				} else {
					if (!a.distance_result) {
						if (platfrom == 2) {
							ios_bridge.callHandler("getDistance", {}, function(c) {
								ios_info.distance = c;
								if (c < 2000) {
									distanceTip()
								} else {
									pageTo("toLottery.php")
								}
							})
						} else {
							if (platfrom == 1) {
								if (window.cmactivityjs.getDistance() < 2000) {
									distanceTip()
								} else {
									pageTo("toLottery.php")
								}
							}
						}
					}
				}
			}
		}
	})
}

function chkPrize(c) {
	var a = false;
	if (platfrom == 1) {
		var b = getAppData();
		a = chkLotteryStat({
			"duid": b.duid,
			"kuid": b.userid,
			"distance": b.distance
		}, c)
	} else {
		if (platfrom == 2) {
			a = chkLotteryStat({
				"duid": ios_info.duid,
				"kuid": ios_info.userid,
				"distance": ios_info.distance
			}, c)
		}
	}
	return a
}

function chkLotteryStat(e, g) {
	var a = "";
	var b = "";
	var d = "";
	var c = {
		"distance": e.distance
	};
	typeof(e.duid) != "undefined" && (a = e.duid);
	typeof(e.kuid) != "undefined" && (b = e.kuid);
	typeof(e.mobile) != "undefined" && (d = e.mobile);
	!isNaN(a) && (a = parseInt(a));
	if (a) {
		c.duid = a;
		c.duid_flag = 1
	} else {
		if (g) {
			g(false, "获取数据失败")
		}
		return false
	}!isNaN(b) && (b = parseInt(b));
	if (b) {
		c.kuid = b;
		c.kuid_flag = 1;
		c.distance_flag = 1
	}
	if (d) {
		c.mobile = d;
		c.mobile_flag = 1
	}
	var f = $.ajax({
		url: "getPrizeInfo.php",
		type: "POST",
		dataType: "json",
		data: c,
		async: true,
		timeout: 15000,
		success: function(h) {
			if (h.errcode == 0) {
				if (g) {
					g(h)
				}
			} else {
				if (g) {
					g(false, h.errmsg)
				}
			}
		},
		error: function(j, h, i) {
			if (g) {
				if (h == "timeout") {
					g(false, "请求超时")
				} else {
					g(false, "数据获取失败")
				}
			}
		}
	})
}

function getPrizeList(b) {
	var a = $.ajax({
		url: "getPrizeList.php",
		type: "POST",
		dataType: "json",
		async: true,
		timeout: 15000,
		success: function(c) {
			if (c.errcode == 0) {
				if (b) {
					b(c.data, c.errmsg)
				}
			}
		},
		error: function(e, c, d) {
			if (b) {
				if (c == "timeout") {
					b(false, "请求超时")
				} else {
					b(false, "数据获取失败")
				}
			}
		}
	})
}

function isLogin() {
	return window.cmactivityjs.isUserLogin()
}

function doNavLogin(a) {
	showPromptDialog("#prompt-dialog", a, "以后再说", "立即登录", function() {
		dismissPopup("#prompt-dialog");
		if (platfrom == 1) {
			window.cmwebbrowsetojs.doWebMapAction("{}", 101)
		} else {
			if (platfrom == 2) {
				var b = {
					actionType: 101,
					params: "{}"
				};
				ios_bridge.callHandler("doWebMapAction", b, function(c) {})
			}
		}
	})
}

function gotDevPrizeTip() {
	showPromptDialog("#prompt-dialog", "您已经使用该设备领过奖了，具体请查看活动规则", "知道了", "查看活动规则", function() {
		dismissPopup("#prompt-dialog", function(a, b) {
			openPopup("#rules-dialog", true)
		})
	})
}

function gotUserPrizeTip() {
	showPromptDialog("#prompt-dialog", "该凯立德帐号领过奖了，具体请查看活动规则", "知道了", "查看活动规则", function() {
		dismissPopup("#prompt-dialog", function(a, b) {
			openPopup("#rules-dialog", true)
		})
	})
}

function distanceTip() {
	showPromptDialog("#prompt-dialog", "正常使用凯立德完成1次导航，才可以抽奖哦，具体请查看活动规则", "知道了", "查看活动规则", function() {
		dismissPopup("#prompt-dialog", function(a, b) {
			openPopup("#rules-dialog", true)
		})
	})
}

function toGuide() {
	$("#open-browser").fadeIn()
}

function showHistory() {
	onEvent("100", "5003");
	if (at_app) {
		if (platfrom == 1) {
			if (isLogin()) {
				loading(true);
				$("#lottery_recoder").addClass("ui-state-disabled");
				chkPrize(onGetHistory)
			} else {
				doNavLogin("登录后，才可以查看您的中奖记录哦～")
			}
		} else {
			if (platfrom == 2) {
				ios_bridge.callHandler("isUserLogin", null, function(a) {
					if (a != "false") {
						ios_info = {};
						ios_bridge.callHandler("getDeviceInfo", {}, function(b) {
							b = jQuery.parseJSON(b);
							ios_info.duid = b.duid;
							ios_info.appid = b.appid;
							ios_info.apptype = b.apptype;
							ios_info.appver = b.appver;
							ios_info.business = b.business;
							ios_info.cid = b.cid;
							ios_bridge.callHandler("getUserInfo", {}, function(c) {
								c = jQuery.parseJSON(c);
								ios_info.userid = c.userid;
								ios_info.session = c.session;
								ios_info.username = c.username;
								loading(true);
								$("#lottery_recoder").addClass("ui-state-disabled");
								chkPrize(onGetHistory)
							})
						})
					} else {
						doNavLogin("登录后，才可以查看您的中奖记录哦～")
					}
				})
			}
		}
	} else {
		showToast("#ui-toast", "请登录凯立德导航客户端，进入此活动页面查看")
	}
}
var onGetHistory = function(a, b) {
	if (!a) {
		$("#lottery_recoder").removeClass("ui-state-disabled");
		loading(false);
		showToast("#ui-toast", b)
	} else {
		if (!a.duid_result || !a.kuid_result) {
			getUserPrize(function(c, f) {
				loading(false);
				$("#lottery_recoder").removeClass("ui-state-disabled");
				var d = "";
				var e = "";
				if (c.errcode == 0) {
					d = c.mobile;
					e = c.prize;
					$("#history-number").html(hideNumber(d));
					$("#history-prize").html(e);
					$(".share-dialog-button").attr("prize", e);
					openPopup("#prize-history-dialog");
					onEvent("100", "5007")
				} else {
					if (c.errcode == 605) {
						showToast("#ui-toast", "此帐号没有参与抽奖哦")
					} else {
						showToast("#ui-toast", f)
					}
				}
			})
		} else {
			loading(false);
			$("#lottery_recoder").removeClass("ui-state-disabled");
			showToast("#ui-toast", "此帐号没有参与抽奖哦")
		}
	}
};

function getUserPrize(c) {
	var b = {};
	if (platfrom == 1) {
		b = getAppData()
	} else {
		if (platfrom == 2) {
			b = ios_info
		}
	}
	var a = $.ajax({
		url: "getUserPrize.php",
		type: "POST",
		dataType: "json",
		data: b,
		async: true,
		timeout: 15000,
		success: function(d) {
			if (d.errcode == 0 || d.errcode == 605) {
				if (c) {
					c(d)
				}
			} else {
				if (c) {
					c(false, d.errmsg)
				}
			}
		},
		error: function(f, d, e) {
			if (c) {
				if (d == "timeout") {
					c(false, "请求超时")
				} else {
					c(false, "数据获取失败")
				}
			}
		}
	})
}

function getPrizeValidity(a) {
	$.ajax({
		url: "getPrizeValidity.php",
		type: "POST",
		dataType: "json",
		async: true,
		timeout: 15000,
		success: function(b) {
			if (b.errcode == 0) {
				if (a) {
					a(b)
				}
			} else {
				if (a) {
					a(false, b.errmsg)
				}
			}
		},
		error: function(d, b, c) {
			if (a) {
				if (b == "timeout") {
					a(false, "请求超时")
				} else {
					a(false, "数据获取失败")
				}
			}
		}
	})
}

function initWeixin() {
	if (atWeixin()) {
		var a = jQuery.parseJSON(share_info);
		wx.config({
			debug: false,
			appId: a.appId,
			timestamp: a.timestamp,
			nonceStr: a.noncestr,
			signature: a.signature,
			jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage"]
		});
		wx.ready(function() {
			wx.onMenuShareAppMessage({
				title: "加油券免费领！新版凯立德导航福利送不停",
				desc: "凯立德导航全新改版啦！使用导航领免费加油券活动上线了~",
				link: siteurl + "/navi_topic/lottery.php",
				imgUrl: siteurl + "/navi_topic/images/lottery/ic_share_winning.png",
				fail: function(b) {
					showToast("#ui-toast", JSON.stringify(b))
				}
			});
			wx.onMenuShareTimeline({
				title: "凯立德导航全新改版啦！使用导航领免费加油券活动上线了~",
				link: siteurl + "/navi_topic/lottery.php",
				imgUrl: siteurl + "/navi_topic/images/lottery/ic_share_winning.png",
				success: function(b) {
					showToast("#ui-toast", "分享成功")
				},
				fail: function(b) {
					showToast("#ui-toast", JSON.stringify(b))
				}
			})
		});
		wx.error(function(b) {})
	}
}

function statistics(c, b) {
	var d = parseInt(new Date().getTime() / 1000);
	var a = {
		busid: 207005,
		evid: c,
		times: 1,
		time: d,
		relids: [b]
	};
	$.ajax({
		type: "POST",
		url: "putStatData.php",
		async: true,
		dataType: "json",
		data: {
			data: a
		},
		success: function(e) {
			if (e && e.errcode != 0) {
				console.log("errcode=" + e.errcode + " errMsg:" + e.errmsg)
			}
		},
		error: function(g, e, f) {
			console.log("error = " + e + ", exception: " + f)
		}
	})
}

function indexInit(c) {
	setTimeout(function() {
		onEvent("100", "5006");
		getSourceType(function(e) {
			var f = parseInt("510" + e);
			statistics(107, f)
		});
		var d = navigator.userAgent.toLowerCase();
		if (/iphone|ipod|ipad/.test(d) && /os 9_/.test(d) && /safari/.test(d)) {
			showToast("#ui-toast", "若点击‘我要抽奖’按钮后提示无法打开网页，请您前往App Store下载最新版凯立德客户端，从客户端进入活动。", true)
		}
		$(document).off("pageinit", "#index_page", indexInit)
	}, 1000);
	setTimeout(function() {
		var d = at_app ? 5301 : 5302;
		statistics(106, d);
		updatePrizeList()
	}, 300);
	initWeixin();
	var b = siteurl + "/navi_topic/images/lottery/";
	var a = [b + "tottery_bg.png", b + "cancel.png", b + "close.png", b + "ic_ls_phone_1.png", b + "ic_round.png", b + "btn_share.png", b + "btn_share_press.png", b + "ic_weixin_friend.png", b + "btn_lottery.png", b + "btn_lottery_press.png", b + "ic_weixin_circle.png", b + "btn_rule.png", b + "btn_rule_press.png", b + "btn_cognknown.png", b + "btn_cognknown_press.png", b + "open_browser.png", b + "ic_ls_phone.png", b + "btn_know.png", b + "open_share.png", b + "circular.png"];
	preloadImages(a).done(function(d) {
		$(".loading").fadeOut(300)
	})
}
$(document).on("pageinit", "#index_page", indexInit);