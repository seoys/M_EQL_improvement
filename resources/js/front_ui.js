/*
 파일명:		abc.front.js
 설  명:		 공통 자바스크립트
 작성자:		glim
 최초작성일:	  2019/00/00
 최종수정일:
*/

// IE 10 NodeList.forEach 함수 선언
if (window.NodeList && !NodeList.prototype.forEach) {
	NodeList.prototype.forEach = function (callback, thisArg) {
		thisArg = thisArg || window;
		for (var i = 0; i < this.length; i++) {
			callback.call(thisArg, this[i], i, this);
		}
	};
}

(function () {
	if (
		typeof window.CustomEvent === "function" ||
		// In Safari, typeof CustomEvent === 'object' but it otherwise works fine
		this.CustomEvent.toString().indexOf('CustomEventConstructor') > -1
	) {
		return;
	}

	function CustomEvent(event, params) {
		params = params || {bubbles: false, cancelable: false, detail: undefined};
		var evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return evt;
	}

	CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = CustomEvent;
})();

$(function () {
	// 상품 옵션 커스터마이징
	$.widget('custom.selectProdOption', $.ui.selectmenu, {
		_drawButton: function () {
			this._super();

			var selected, placeholder;
			selected = this.element.find('[selected]').length;
			placeholder = this.options.placeholder;

			if (!selected && placeholder) {
				this.buttonItem.text(placeholder);
			}
		},
		_resetDrawButton: function () {
			var selected, placeholder;
			selected = this.element.find('[selected]').length;
			placeholder = this.options.placeholder;

			if (!selected && placeholder) {
				this.buttonItem.text(placeholder);
			}
		},
		reset: function () {
			this.element[0].selectedIndex = -1;
			this._resetDrawButton();
		},
		_renderItem: function (ul, item) {
			var li, wrapper, labelBox, imminentBox, isStock;
			li = $('<li>');
			wrapper = $('<div>', {
				'class': 'prod-option',
			});

			if (item.disabled) {
				li.addClass('ui-state-disabled');
			}
			isStock = item.element.attr('data-stock') !== undefined && item.element.data('stock') < 6;
			wrapper.data(item.element.data());

			labelBox = $('<span>', {
				'class': 'option-label-box',
			});
			$('<span>', {
				'class': 'option-label-box-inner',
				'text': item.label,
			}).appendTo(labelBox);
			wrapper.append(labelBox);

			if (!item.disabled && isStock) {
				imminentBox = $('<span>', {
					'class': 'option-stock-box',
					'text': '품절임박 (' + item.element.data('stock') + ')',
				}).appendTo(labelBox);
			}
			return li.append(wrapper).appendTo(ul);
		}
	});

});

var handsome = handsome || {};
handsome.ui = handsome.ui || {};

handsome.ui.front = handsome.ui.front || (function () {
	var _front = {}, _isMacLike, _vh, _isAndroid, _resizeVh, _fisHeight = 0, _dialogCount = 0, _loadingCount = 0;

	/**
	 * 유튜브 태그 삽입
	 */
	function setYoutubeAPITag() {
		var tag = document.createElement('script');

		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}

	////////////////////////////////////////////////////////////
	// 공통 UI 스크립트
	////////////////////////////////////////////////////////////

	/**
	 * [common] 하단 고정되는 영역 기능 구현
	 */
	function setbottomFixNav() {
		if ($('.bottom-fix-nav').length <= 0) return false;
		var fisHeight = 0,
			timer = _isAndroid ? 150 : 100,
			currentScrollTop = 0,
			nextScrollTop = 0,
			dockerWrap = $('.bottom-fix-nav'),
			firstReady = true;
		if (dockerWrap.find('.category-btn-wrap').length > 0) {
			dockerWrap.addClass('has-control');
			setScrollStopped('stop');
		}

		if (dockerWrap.find('.category-btn-wrap , .prd-option-wrap').length > 0) {
			$('.wrap').addClass('has-footer-padding');
			if (dockerWrap.find('.prd-option-wrap').length > 0) {
				$('.bottom-fix-nav').addClass('detail-bottom-fix-nav');
			}
		}

		$(document).on("touchstart", function (e) {
			fisHeight = window.innerHeight;
		});
		$('.wrap').removeClass('has-bottom');
		if (!_isMacLike) setScrollDownDocker();
		setScrollTop();

		// 스크롤
		$(window).on("resize scroll", function (event) {
			currentScrollTop = $(window).scrollTop();
			// 최초 진입시 기능 : 처음 transition 스타일이 실행 되지 않기 위해 추가
			if (firstReady) {
			} else { // 스크롤 중간에서 새로고침 했을 경우
				if (!$('.wrap').hasClass('has-bottom')) $('.wrap').addClass('has-bottom');
			}

			// Docker : 스크롤 다운 되었을때 기능
			if (!_isMacLike) setScrollDownDocker();

			// top 버튼 : ( 해상도높이/5 ) 스크롤 지점에서 노출
			setScrollTop();


			// ios 브라우저에서 툴바가 사라졌을때 사라지게 하기 위함
			clearTimeout(dockerWrap.data('scrollEnd'));
			dockerWrap.data('scrollEnd', setTimeout(function () {
				if (_isMacLike && dockerWrap.find('.docker-box').length > 0) {
					if (window.innerHeight - fisHeight < 0) {
						if (dockerWrap.hasClass('scroll-down')) dockerWrap.removeClass('scroll-down');
					} else if (window.innerHeight - fisHeight === 0) {
						setScrollDownDocker();
					} else {
						if (!dockerWrap.hasClass('scroll-down')) dockerWrap.addClass('scroll-down');
					}
				}
			}, event));

			// category : 스크롤이 움직임이 끝나고 지정 초 이후 실행
			if (dockerWrap.hasClass('has-control')) setScrollStopped();
			clearTimeout(dockerWrap.data('scrollTimer'));

			dockerWrap.data('scrollTimer', setTimeout(function () {
				if (dockerWrap.hasClass('has-control')) setScrollStopped('stop');
			}, timer, event));
			firstReady = false;
		});

		function setScrollDownDocker() {
			if (dockerWrap.find('.docker-box').length <= 0) return false;

			if ((nextScrollTop < currentScrollTop && nextScrollTop > 0)) {
				// console.log('add scroll-down');
				if (!dockerWrap.hasClass('scroll-down')) dockerWrap.addClass('scroll-down');
			} else {
				// console.log('remove scroll-down');
				if (currentScrollTop >= ($(document).height() - window.innerHeight - 2)) return; // ios에서 하단 넘어갈 경우
				if (dockerWrap.hasClass('scroll-down')) dockerWrap.removeClass('scroll-down');
			}

			nextScrollTop = currentScrollTop;

		}

		function setScrollTop() {
			var topBtnViewVal = Math.floor($(window).height() / 5);

			if (currentScrollTop <= topBtnViewVal) {
				dockerWrap.find('.btn-arrow-top').removeClass('is-active');
			} else {
				dockerWrap.find('.btn-arrow-top').addClass('is-active');
			}
		}

		/*  스크롤 이 멈췄을때 실행 */
		function setScrollStopped(sta) {
			if (dockerWrap.find('.category-btn-wrap').length < 0) return false;

			if (sta === 'stop') {
				dockerWrap.find('.prod-control-fix-wrap').addClass('is-active');
			} else {
				dockerWrap.find('.prod-control-fix-wrap').removeClass('is-active');
			}

		}
	}

	/**
	 * 테이블 캡션 생성
	 * @param selector 테이블 DOM 셀렉터(default : .tbl-wrap table)
	 */
	function setTableCaption(selector) {
		selector = selector ? selector + ' .tbl-wrap table' : '.tbl-wrap table';
		$(selector).each(function (index) {
			var table, tableClass, captionText, captionComplex, theadHeader, tbodyHeader, bodyToHeadIdxs, hasThead,
				captionSubFix;
			table = $(this);
			tableClass = $(this).closest('.tbl-wrap, .tbl-col').attr("class");
			captionTextOrigin = $(this).find("caption").text();
			captionComplex = "";
			captionSubFix = "";
			theadHeader = [];
			tbodyHeader = [];
			bodyToHeadIdxs = [];
			hasThead = false;

			if (tableClass.match("tbl-form") && tableClass.match("form-view") !== null) {
				captionSubFix = "을(를) 입력하는 표입니다.";
			} else {
				captionSubFix = "을(를) 나타낸 표입니다.";
			}

			// thead th값 추출
			if ($(this).find("thead th").length > 0) {
				$(this).find("thead th").each(function (index) {
					theadHeader.push($(this).text());
				});
			}
			// tbody th값 추출
			if ($(this).find("tbody th").length > 0) {
				$(this).find("tbody th").each(function (index) {
					// tbody th가 thead th의 서브 헤더인 경우(thead th와 tbody th가 둘 다 존재하는 경우)
					if (theadHeader.length > 0) {
						if (tbodyHeader[$(this).index()] === undefined) {
							tbodyHeader[$(this).index()] = theadHeader[$(this).index()] + " 컬럼의 하위로";
						}
						tbodyHeader[$(this).index()] += " " + $(this).text();
					} else {
						tbodyHeader.push($(this).text());
					}
				});

				tbodyHeader = tbodyHeader.filter(function (n) {
					return n !== undefined;
				});
			}

			if (theadHeader.length > 0 && tbodyHeader.length > 0) {
				captionComplex += theadHeader.join(", ") + " " + tbodyHeader.join(", ");
			} else if (theadHeader.length > 0) {
				captionComplex += theadHeader.join(", ");
			} else if (tbodyHeader.length > 0) {
				captionComplex += tbodyHeader.join(", ");
			}

			//console.log(captionTextOrigin + " 목록이며 " + captionComplex +  " 을(를) 나타낸 표입니다.");
			$(this).find("caption").text(captionTextOrigin + " 테이블로 " + captionComplex + captionSubFix);
		});
	}


	/**
	 * jQuery UI 탭 설정
	 * @param selector Tab 생성 DOM 셀렉터(default : .js-tab)
	 */
	function setUITabs(selector) {
		selector = selector || '.js-tab';

		if ($(selector).length > 0) {
			$(selector).each(function (index) {
				var disabledTabs;
				disabledTabs = [];
				if ($(this).hasClass('anchor-tab')) {
					return;
				}
				$(this).find('> .tabs .tab-link').each(function (index) {
					if ($(this).hasClass('tab-disabled')) {
						disabledTabs.push(index);
					}
				});
				$(this).tabs({
					disabled: disabledTabs,
					beforeActivate: function (event, ui) {
						if ($(ui.newTab).find('a').attr('href').indexOf('#') !== 0) {
							window.open($(ui.newTab).find('a').attr('href'), '_self');
						}
					},
					activate: function (event, ui) {
						// 탭 내 스와이퍼 기능 정상 작동하도록 update 처리
						ui.newPanel[0].querySelectorAll('[class*=swiper-container-]').forEach(function (element) {
							element.swiper.update();
						});
					},
				});
			});
		}
	}

	/**
	 * jQuery UI 탭이 좌우 스크롤이 필요한 경우 설정
	 * @param selector 스크롤이 필요한 탭 DOM 셀렉터(default : .swiper-tab)
	 */
	function setUITabsSwiper(selector) {
		var headerHeight = $('.header-wrap').length > 0 ? parseInt($('.header-wrap').outerHeight()) : 0;
		var selector = selector || '.swiper-tab';
		var idx = 0;
		var tabSwiper;
		if ($(selector).length > 0) {
			$(selector).each(function (index) {
				var $this = $(this);
				/*if (!$this.closest('.tab-wrap').hasClass('js-tab')) {}*/
				if ($this.find('.tab-item.is-active').length === 0) {
					idx = 0;
				} else {
					$this.find('.tab-item').each(function (i) {
						if ($(this).hasClass('is-active')) {
							idx = i;
						}
					});
				}
				$this.find('.tab-item').eq(idx).addClass('is-active');
				tabSwiper = new Swiper($this, {
					on: {
						init: function () {
							var that = this;
							$(that.$el).find('.tab-item').each(function () {
								if ($(this).find('.tab-link').hasClass('tab-disabled')) {
									$(this).addClass('tab-disabled');
								}
							});

							$(that.$el).find('.tab-item').off('click').on('click', function (event) {
								event.preventDefault();
								$(this).closest('.tabs').find('.tab-item').removeClass('is-active');
								$(this).addClass('is-active');
							});
						},
					},
					slidesPerView: 'auto',
					observer: true,
					observeParents: true,
					initialSlide: idx,
					slideToClickedSlide: true,
					disabledClass: 'tab-disabled',
				});


				if ($(this).hasClass('sps')) {
					$(this).attr('data-sps-offset', Math.round($(this).closest('.tab-wrap').offset().top - headerHeight));
				}

				if (!$(this).closest('.tab-wrap').hasClass('js-tab')) {
					$(this).find('.tab-link').on('click', function () {
						$(this).closest('.tabs').find(' .tab-item').removeClass('is-active');
						$(this).closest('.tab-item').addClass('is-active');
					});
				}

			});
			// fixed type
			$(window).on('resize orientationChange', function () {
				if ($(selector).length > 1) {
					$(selector).each(function (i) {
						$(this).find('.tab-item').each(function (i) {
							if ($(this).hasClass('is-active')) {
								idx = i;
							}
						});
						tabSwiper.update();
						tabSwiper.slideTo(idx);
						if ($(this).hasClass('sps')) {
							$(this).attr('data-sps-offset', Math.round($(this).closest('.tab-wrap').offset().top - headerHeight));
							ScrollPosStyler.init();
						}
					});
				} else {
					tabSwiper.update();
					tabSwiper.slideTo(idx);
					if ($(selector).hasClass('sps')) {
						$(selector).attr('data-sps-offset', Math.round($(selector).closest('.tab-wrap').offset().top - headerHeight));
						ScrollPosStyler.init();
					}
				}
			});
		}
	}

	/**
	 * jQuery UI 다이얼로그 설정
	 * @param btnSelector 다이얼로그 오픈 버튼 DOM 셀렉터(default : [data-popup-trigger])
	 * @param selector 다이얼로그 DOM 셀렉터(default : .ui-dialog-contents)
	 */
	function setUIDialog(btnSelector, selector) {
		selector = selector || '.ui-dialog-contents';
		btnSelector = btnSelector || '[data-popup-trigger]';
		if ($(selector).length > 0) {
			// title : 타이틀 스타일 추가를 위해 html 소스로 전달

			$.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
				_title: function (title) {
					if (this.options.title) {
						title.html(this.options.title);
					}
				}
			}));

			$(selector).each(function (index) {
				var dialogClass, containerId, dialogId, containerClasses, scrollTop, bottomFix;

				containerId = $(this).data('container');
				containerClasses = 'ui-dialog-container';
				dialogClass = '';

				if (containerId === undefined) {
					containerId = 'body';
				}

				if ($(this).data('class') !== undefined) {
					if (isNaN(parseInt($(this).data('class')))) {
						dialogClass = $(this).data('class');
					} else {
						dialogClass = 'auto';
					}
				}

				dialogId = containerId.replace('#', '') + 'Dialog' + _dialogCount;
				$(containerId).append('<div id="' + dialogId + '" class="' + containerClasses + '"><div class="ui-dialog-container-inner"></div></div>');


				if (dialogClass.indexOf('dialog-full') === 0) {
					$('#' + dialogId).addClass('full');
				}

				_dialogCount++;

				$(this).dialog({
					appendTo: containerId + ' #' + dialogId + ' .ui-dialog-container-inner',
					autoOpen: false,
					// modal: true,
					resizable: false,
					draggable: false,
					minHeight: 'none',
					classes: {
						'ui-dialog': 'ui-corner-all ' + dialogClass,
					},
					position: null,
					// position: {my: 'center', at: 'center', of: ('#' + dialogId + ' .ui-dialog-container-inner')},
					open: function (event, ui) {
						var that, inlineStyle;
						that = this;
						inlineStyle = {};
						scrollTop = $(window).scrollTop();
						if (containerId !== 'body') {
							inlineStyle.height = $(containerId).outerHeight();
							inlineStyle.top = $(containerId).find('.os-viewport').length !== 0 ? $(containerId).find('.os-viewport').scrollTop() : $(containerId).scrollTop();
						} else {
							inlineStyle.top = 0;
						}

						if (scrollTop !== 0 & $('.bottom-fix-nav').hasClass('scroll-down')) {
							bottomFix = true;
						} else {
							bottomFix = false;
						}
						$(containerId).css({
							'top': scrollTop * -1,
						});

						$(containerId).addClass('dialog-open');
						$(containerId).append($('#' + dialogId));
						$(that).closest('.ui-dialog-container').css(inlineStyle);
						$(that).closest('.ui-dialog-container').addClass('open');
						//$(that).closest('.ui-dialog-container').css('height', document.documentElement.clientHeight);
						if (dialogClass.indexOf('dialog-bottom') === 0 || dialogClass.indexOf('dialog-full') === 0) {
							// 배경 닫기 버튼 기능
							clearTimeout($(that).data('open'));
							$(that).data('open', setTimeout(function () {
								$('#' + dialogId).find('.' + dialogClass).addClass('is-open');
							}, 100));

						}

						if (dialogClass.indexOf('dialog-bottom') === 0) {
							//$('#' + dialogId + ' .ui-dialog-container-inner .ui-dialog-content').css( 'padding-bottom', document.documentElement.clientHeight - window.innerHeight );
							// 배경 닫기 버튼 기능
							if ($('#' + dialogId + ' .ui-dialog-container-inner .btn-close-dim').length === 0) {
								$('#' + dialogId + ' .ui-dialog-container-inner').append('<button type="button" class="btn-close-dim"></button>');
							}

							$('#' + dialogId + ' .ui-dialog-container-inner .btn-close-dim').off('click').on('click', function () {
								$(that).dialog('close');
							});
						}

						if ($('[data-layer-close]', that).length > 0) {
							$('[data-layer-close]', that).off('click').on('click', function () {
								$(that).dialog('close');
								if (bottomFix) {
									$('.bottom-fix-nav').addClass('scroll-down');
								}
							});
						}

						if (bottomFix) {
							clearTimeout($(that).data('downType'));
							$(that).data('downType', setTimeout(function () {
								$('.bottom-fix-nav').addClass('scroll-down');
							}, event));
						}

					},

					close: function (event, ui) {
						var that = this;
						// console.log(that);

						if (dialogClass.indexOf('dialog-bottom') === 0 || dialogClass.indexOf('dialog-full') === 0) {
							$(that).closest('.' + dialogClass).removeClass('is-open');
						}

						if (dialogClass.indexOf('dialog-bottom') === 0) {
							$('.btn-close-dim').remove();
						}

						$(that).closest('.ui-dialog-container').removeClass('open');
						// console.log($(containerId).find('.ui-dialog-container.open').length);
						if ($(containerId).find('.ui-dialog-container.open').length === 0) {
							scrollTopPos = $('body').css('top');
							$('body').css({
								'top': 0,
							});
							$(containerId).removeClass('dialog-open');
							$(window).scrollTop(parseInt(scrollTopPos) * -1);

							if (bottomFix) {
								clearTimeout($(that).data('downType'));
								$(that).data('downType', setTimeout(function () {
									$('.bottom-fix-nav').addClass('scroll-down');
								}, event));
							}
						}
					},
				});

			});
		}


		if ($(btnSelector).length > 0) {
			$(btnSelector).each(function (index) {
				$(this).off('click').on('click', function (event) {
					event.preventDefault();
					if (_isMacLike) {
						setTimeout(function(){
							_resizeVh = (window.innerHeight + 1);
							document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
						}, 500);
					} else if (_isAndroid) {
						setTimeout(function(){
							_resizeVh = window.outerHeight;
							document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
						}, 500);

					}
					$($(this).data('target')).dialog('open');
					// 타켓 팝업 닫기
					if ($(this).data('close-trigger') !== undefined) {
						if ($(this).data('close-target') === undefined) {
							$(this).closest('.ui-dialog-contents').dialog('close');
						} else {
							$($(this).data('close-target')).dialog('close');
						}
					}
				});
			});
		}
	}

	/**
	 * 다이얼로그 팝업 노출 버튼 클릭후 팝업 노출 callback 설정
	 * @param btnSelector 팝업 노출 버튼 DOM 셀렉터
	 * @param callback callback 함수
	 */
	function setUIDialogCallback(btnSelector, callback) {
		if ($(btnSelector).length > 0) {
			$(btnSelector).each(function (index) {
				$(this).on('click', function (event) {
					if ($($(this).data('target')).dialog('isOpen')) {
						if (callback != null && $.isFunction(callback)) callback.apply(null, []); // callback 실행
					}
				});
			});
		}
	}

	/**
	 * Fold box 기본 설정
	 * @param selector Fold box 컨테이너 DOM 셀렉터(default : .js-fold)
	 */
	function setFoldBox(selector) {
		selector = selector ? selector : '.js-fold';
		if ($(selector).length > 0) {
			$(selector).find('.fold-box .fold-box-header').each(function (index) {
				$(this).off('click').on('click', function (event) {
					if ($(event.target).is('a') || $(event.target).is('button')) {
						event.preventDefault();
						return;
					}

					if (($(this).siblings('.fold-box-contents').length === 0 || $(this).hasClass('no-contents')) && !$(this).hasClass('header-only')) return false;
					if ($(event.currentTarget).closest(selector).data('type') === 'multi') {
						$(event.currentTarget).closest('.fold-box').toggleClass('expanded');
						$(event.currentTarget).find('.ico-toggle').toggleClass('is-reverse');
					} else {
						var isExpanded;
						isExpanded = $(this).closest('.fold-box').hasClass('expanded');
						$(this).closest(selector).find('.fold-box').removeClass('expanded');
						isExpanded ? $(this).closest('.fold-box').removeClass('expanded')
							: $(this).closest('.fold-box').addClass('expanded');

						$(this).closest(selector).find('.ico-toggle').addClass('is-reverse');
						isExpanded ? $(this).find('.ico-toggle').addClass('is-reverse')
							: $(this).find('.ico-toggle').removeClass('is-reverse');
					}
					var evtData = {
						index: $(event.currentTarget).closest('.fold-box').index(),
						isExpanded: $(event.currentTarget).closest('.fold-box').hasClass('expanded'),
					};
					var evt = new CustomEvent('headerClick', {'detail': evtData});
					// console.log(evt)
					//$(event.currentTarget).closest('.fold-box')[0].dispatchEvent(evt);
				});
			});
		}
	}

	/**
	 * jQuery Marquee 플러그인 설정
	 * @param selector jQuery Marquee DOM 셀렉터(default : .js-marquee-text)
	 */
	function setMarquee(selector) {
		selector = selector ? selector : '.js-marquee-text';

		if ($(selector).length > 0) {
			$(selector).each(function (index) {
				$(this).marquee({
					duration: $(this).data('marqueeDuration') ? $(this).data('marqueeDuration') * 1000 : 5000,
					gap: $(this).data('marqueeGap') ? $(this).data('marqueeGap') : 50,
					duplicated: true,
				});
			});
		}
		$(window).on('resize', function () {
			$(selector).each(function (index) {
				$(this).marquee('destroy').marquee({
					duration: $(this).data('marqueeDuration') ? $(this).data('marqueeDuration') * 1000 : 5000,
					gap: $(this).data('marqueeGap') ? $(this).data('marqueeGap') : 50,
					duplicated: true,
				});
			});
		});
	}

	/**
	 * Star Rating 플러그인 설정
	 * @param selector Star Rating DOM 셀렉터(default : .js-rating)
	 */
	function setStarRating(selector) {
		selector = selector || '.js-rating';

		if ($(selector).length <= 0) return false;

		if ($(selector).length > 0) {
			$(selector).rating({
				language: 'ko',
				showCaption: false,
				showClear: false,
				min: 1,
				max: 5,
				step: 1,
			});
		}
	}

	/**
	 * jQuery UI Spinner 설정
	 * @param selector Spinner DOM 셀렉터(default : .js-spinner)
	 */
	function setUISpinner(selector) {
		selector = selector || '.js-spinner';

		if ($(selector).length <= 0) return false;

		if ($(selector).length > 0) {

			$(selector).each(function (index) {
				$(this).spinner({
					min: 1,
					max: $(this).attr('max') && $(this).attr('max') > 9999 ? 9999 : ($(this).attr('max') ? $(this).attr('max') : 9999),
				});

				if ($(this).hasClass('disabled')) $(this).spinner('option', 'disabled', true);
			});

			$(selector).off('input').on('input', function (event) {
				var val, regExVal;
				val = $(this).spinner('value');
				if (val === null) {
					val = 1;
				}
				regExVal = val.toString().replace(/[^\d+$]/g, '');
				$(this).spinner('value', regExVal);
				//this.value = this.value.replace(/^[1-9]+[0-9]*$/g, '');
			});
		}
	}

	/**
	 * 유튜브 DOM 구조 Youtube Iframe API 셋팅
	 * @param target 유튜브 Iframe 노출 할 DOM jQuery Object
	 * @param videoUrl 비디오 URL
	 * @param onReadyCallback 비디오 플레이 준비완료 callback 함수
	 */
	function setYoutubeIFrame(target, videoUrl, onReadyCallback) {
		var videoId, playerWrapper, playerTarget, player, iFrameId, videoWidth, videoHeight;
		if (target.is('iframe')) {
			return;
		}

		videoId = getVideoId(videoUrl);
		videoWidth = '100%';
		videoHeight = '100%';//'56.25%';

		iFrameId = 'youtubeFrame' + $('iframe').length;

		playerWrapper = $('<div>', {
			class: 'video-wrap',
		});
		playerTarget = $('<div>', {
			id: iFrameId,
			class: 'youtube-iframe',
		});
		playerWrapper.append(playerTarget);

		playerWrapper.appendTo(target);

		player = new YT.Player(iFrameId, {
			width: videoWidth,
			height: videoHeight,

			playerVars: {
				'playlist': videoId,
				'autoplay': 1,
				'controls': 0,
				'showinfo': 0,
				'rel': 0,
				'disablekb': 1,
				'loop': 1,
				'modestbranding': 1,
			},
			events: {
				'onReady': function (event) {
					var playerTarget;
					playerTarget = $('#' + iFrameId);
					playerTarget.data('player', player);
					// setTimeout(function() {
					// 	console.log('setTimeout');
					// 	event.target.playVideo();
					// }, 1000);
					if (onReadyCallback) {
						onReadyCallback(player);
					}
				},
				'onStateChange': function (event) {
					// console.log('onStateChange', event.data);
					switch (event.data) {
						case 0:	// 종료
						case 2:	// 일시중지
							if (playerWrapper.closest('.swiper-slide').length > 0) {
								playerWrapper.remove();
							}
							break;
						case 5:
							event.target.playVideo();
							document.querySelector('#' + iFrameId).contentWindow.focus();
							break;
					}
				}
			}
		});

		function getVideoId(url) {
			var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
			var match = url.match(regExp);

			if (match && match[7].length === 11) {
				return match[7];
			} else {
				return 'error';
			}
		}
	}

	/**
	 * 비메오 Iframe 셋팅
	 * @param target 비메오 Iframe 노출 할 DOM jQuery Object
	 * @param videoUrl 비디오 URL
	 */
	function setVimeoIframe(target, videoUrl) {
		var videoId, playerWrapper, playerTarget, player, iFrameId, videoWidth, videoHeight;
		if (target.is('iframe')) {
			return;
		}

		videoId = getVideoId(videoUrl);
		videoWidth = '100%';
		videoHeight = '100%';//'56.25%';

		iFrameId = 'vimeoFrame' + $('iframe').length;

		playerWrapper = $('<div>', {
			id: iFrameId,
			class: 'video-wrap vimeo-wrap',
			style: 'padding-top: 56.25%;',
		});

		var iframe = $('<iframe>', {
			src: 'https://player.vimeo.com/video/' + videoId + '?autoplay=1&amp;title=0&amp;byline=0&amp;portrait=0',
			frameborder: 0,
			style: 'position:absolute;top:0;left:0;width:100%;height:100%;',
			allow: 'autoplay; fullscreen',
			allowfullscreen: true,
		});

		playerWrapper.append(iframe).appendTo(target);

		/*
		playerWrapper = $('<div>', {
			id: iFrameId,
			class: 'video-wrap vimeo-wrap',
		});

		playerWrapper.appendTo(target);

		player = new Vimeo.Player(iFrameId, {
			id: videoId,
			autoplay: true,
			responsive: true,
		});
		player.on('loaded', function () {
			document.querySelector('#' + iFrameId + ' iframe').contentWindow.focus();
		});
		*/

		function getVideoId(url) {
			// var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
			var regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
			var match = url.match(regExp);
			return match[1];
		}
	}

	/**
	 * 카테고리 필터 버튼 이벤트 설정
	 */
	function setFilter() {
		var initial = true;
		if ($('.js-tab').hasClass('filter-tab')) {
			if ($('.js-tab .tabs .tab-item').length === 1) {
				setBrandAnchorPos();
			} else {
				// 브랜드 필터 scrollTop setting
				$('.js-tab.filter-tab').tabs({
					activate: function (event, ui) {
						if ($(ui.newPanel).hasClass('filter-brand') && initial === true) {
							setBrandAnchorPos($(this));
							initial = false;
						}
					},
				});
			}
		}

		setSelectFilterSwiper();
	}

	/**
	 * search event tab 필터 설정
	 */
	function setSearchEventFilter() {
		// 브랜드 필터 scrollTop setting
		setBrandAnchorPos($('.js-tab.filter-tab.only-brand'));

		setSelectFilterSwiper('.js-event-selected-swiper');
	}

	/**
	 * search product tab 필터 스크립트
	 */
	function setSearchProdFilter() {
		// 브랜드 필터 scrollTop setting
		$('.js-tab.filter-tab').tabs({
			activate: function (event, ui) {
				if ($(ui.newPanel).hasClass('filter-brand')) {
					setBrandAnchorPos($(this));
				}
			},
		});

		setSelectFilterSwiper('.js-prod-selected-swiper');
	}

	/**
	 * 셀렉트 필터 스와이퍼 설정
	 * @param selector 필터 스와이퍼 DOM 셀렉터(default : .selected-filter-wrap)
	 */
	function setSelectFilterSwiper(selector) {
		selector = selector ? selector : '.selected-filter-wrap';

		var selectSwiper = new Swiper($(selector), {
			init: false,
			slidesPerView: 'auto',
			spaceBetween: 0,
		});

		selectSwiper.init();
	}

	/**
	 * 브랜드 리스트 우측 Anchor 설정
	 * @param selector 필터 탭 DOM 셀렉터(default : .js-tab.filter-tab)
	 */
	function setBrandAnchorPos(selector) {
		selector = selector ? selector : '.js-tab.filter-tab';

		var brandListWrap = $(selector).find('.brand-list-wrap');
		brandListWrap.scrollTop(0);

		// anchor tab scroll pos
		brandListWrap.find('.filter-title').each(function () {
			var originContTop = $(this).position().top;
			$(this).data("originTop", originContTop);
			//console.log(originContTop)
		});

		$('.anchor-list-wrap .anchor-list .anchor-item .btn-anchor').on('click', function (event) {
			var tgBrandName = $(this).data('target').split("#")[1];

			brandListWrap.find('.filter-title').each(function () {
				tgBrandCont = $(this).attr('id');

				if (tgBrandName === tgBrandCont) {
					var contPos = $("#" + tgBrandCont).data("originTop");
					brandListWrap.stop().animate({scrollTop: contPos}, 300);
				}
			});
		});

		// anchor tab swiper
		var brandFilterSwiper;
		brandFilterSwiper = new Swiper($(selector).find('.js-brand-filter-swiper'), {
			init: false,
			direction: 'vertical',
			slidesPerView: 'auto',
		});

		brandFilterSwiper.init();
	}

	/**
	 * 공통 상세 swiper 설정
	 * @param selector DOM 셀렉터(default : .js-detail-content)
	 */
	function setDetailContent(selector) {

		selector = selector ? selector : '.js-detail-content';

		if ($(selector).length <= 0) return false;

		if ($('.gate-banner-wrap .detail-cont-box', selector).length > 3) {
			var gateSwiper;
			gateSwiper = new Swiper($('.gate-banner-wrap > .gate-banner-swiper', selector), {
				init: false,
				slidesPerView: 1,
				spaceBetween: 0,
				speed: 600,
				navigation: {
					prevEl: $('.gate-banner-wrap').find('.btn-swiper-arrow-wrap .btn-swiper-arrow.prev'),
					nextEl: $('.gate-banner-wrap').find('.btn-swiper-arrow-wrap .btn-swiper-arrow.next'),
				},
			});

			gateSwiper.init();
			$('.gate-banner-wrap', selector).addClass('is-active');
		}

		if ($('.js-contents-swiper', selector).length > 0) {
			$('.js-contents-swiper', selector).each(function () {
				var contentSwiper;

				contentSwiper = new Swiper($(this), {
					init: false,
					slidesPerView: 1,
					spaceBetween: 0,
					scrollbar: {
						el: $(this).find('.swiper-scrollbar'),
					},
				});

				contentSwiper.init();
			});
		}

		// 이미지형
		if ($('.js-contents-gallery', selector).length > 0) {
			$('.js-contents-gallery', selector).each(function () {
				var that = $(this);
				var galleryThumbs = new Swiper($(this).find('.js-thumbs'), {
					slidesPerView: 1,
					watchSlidesVisibility: true,
					watchSlidesProgress: true,
					allowTouchMove: false,
				});

				var galleryTop = new Swiper($(this).find('.js-top'), {
					slidesPerView: 1,
					scrollbar: {
						el: $(this).find('.swiper-scrollbar'),
					},
					thumbs: {
						swiper: galleryThumbs,
					},
					allowTouchMove: ($('.contents-banner-item', that).length <= 1) ? false : true
				});
			});
		}

		// 이미지 화보
		if ($('.js-pictorial-gallery', selector).length > 0) {
			$('.js-pictorial-gallery', selector).each(function () {
				var galleryThumbs = new Swiper($(this).find('.js-pictorial-thumbs'), {
					slidesPerView: 'auto',
					spaceBetween: 10,
					watchSlidesVisibility: true,
					watchSlidesProgress: true,
				});

				var galleryTop = new Swiper($(this).find('.js-pictorial-top'), {
					slidesPerView: 1,
					spaceBetween: 0,
					scrollbar: {
						el: $(this).find('.js-pictorial-top .swiper-scrollbar'),
					},
					thumbs: {
						swiper: galleryThumbs,
					},
					on: {
						slideChange: function () {
							if (galleryThumbs !== undefined) {
								galleryThumbs.slideTo(galleryTop.realIndex);
							}
							if (galleryCenter !== undefined) {
								galleryCenter.slideTo(galleryTop.realIndex);
							}
						},
					},
				});

				if ($(this).find('.js-pictorial-center').length > 0) {
					var galleryCenter = new Swiper($(this).find('.js-pictorial-center'), {
						slidesPerView: 1,
						spaceBetween: 0,
						allowTouchMove: false,
					});
				}
			});
		}

		//연관상품 swipe
		if ($('.js-related-prod-wrap', selector).length > 0) {
			$('.js-related-prod-wrap', selector).each(function () {
				var contentProdSwiper;

				contentProdSwiper = new Swiper($(this), {
					init: false,
					slidesPerView: 'auto',
					spaceBetween: 10,
				});

				contentProdSwiper.init();
			});
		}

		setUITabsSwiper();
	}

	/**
	 * 노티용 스티키 팝업 노출
	 * @param target 스티키 팝업 DOM 셀렉터
	 */
	function setStickyMoction(target) {
		if (typeof $(target).data('timer') === 'number' && $(target).length === 0) return false;

		if (!$(target).hasClass('is-moction')) $(target).addClass('is-moction');

		$(target).data('timer', setTimeout(function () {
			$(target).removeClass('is-moction');
			$(target).data('timer', '');
		}, 1500));

	}

	/**
	 * document ready 시 애니메이션이 필요한 화면 설정
	 * @param isStart 애니메이션 시작/종료 여부
	 * @param selector 애니메이션을 시작/종료할 DOM 셀렉터(default : .js-animate)
	 */
	function setStartTransition(isStart, selector) {
		selector = selector ? selector : '.js-animate';
		if (isStart) {
			$(selector).addClass('is-animate');
		} else {
			$(selector).removeClass('is-animate');
		}
	}

	/**
	 * 로딩 팝업 Show
	 */
	function showLoadingPopup() {
		if ($('#loadingPopup').length === 0) {
			$('body').append('<div id="loadingPopup" class="ui-dialog-contents" title="로딩 팝업" data-class="dialog-loading"><div class="loading-motion"></div><p class="loading-text">Loading<span class="loading-dot">...</span></p></div>');

			handsome.ui.front.setUIDialog('#loadingPopup');
			$('#loadingPopup').on('dialogopen', function (event, ui) {
				window.popupLoading = lottie.loadAnimation({
					wrapper: this.querySelector('.loading-motion'),
					animType: 'html',
					loop: true,
					prerender: true,
					autoplay: true,
					path: '/resources/lottie/loading.json',
				});
			});
			$('#loadingPopup').on('dialogclose', function (event, ui) {
				window.popupLoading.destroy();
				window.popupLoading = null;
			});
		}

		if (!$('#loadingPopup').dialog('isOpen')) {
			$('#loadingPopup').dialog('open');
		}
	}

	/**
	 * 로딩 팝업 Hide
	 */
	function hideLoadingPopup() {
		$('#loadingPopup').dialog('close');
	}

	/**
	 * 상품 리스트 등 더보기 시 하단 로딩 아이콘 Attach
	 * @param container 로딩 아이콘 노출할 container DOM 셀렉터
	 */
	function attachLoading(container) {
		var loadingAnimation;
		$(container).append('<div id="attachLoading' + _loadingCount + '" class="attach-loading"></div>');

		loadingAnimation = lottie.loadAnimation({
			container: document.getElementById('attachLoading' + _loadingCount),
			animType: 'html',
			loop: true,
			prerender: true,
			autoplay: true,
			path: '/resources/lottie/loading.json',
		});
		_loadingCount++;

		$(container).data('attachLoading', loadingAnimation);
	}

	/**
	 * 상품 리스트 등 더보기 시 하단 로딩 아이콘 Detach
	 * @param container 로딩 아이콘 삭제할 container DOM 셀렉터
	 */
	function detachLoading(container) {
		var loading;
		loading = $(container + ' .attach-loading');
		$(container).data('attachLoading').destroy();
		loading.remove();
	}

	/**
	 * 기본 UI 설정
	 * @param selector 특정 영역 하위 기본 UI 설정을 위한 DOM 셀렉터
	 */
	function initUI(selector) {
		var initSelector;
		initSelector = {
			tableCaption: selector ? selector + ' .tbl-wrap table' : '.tbl-wrap table',
			tab: selector ? selector + ' .js-tab' : '.js-tab',
			dialog: selector ? selector + ' .ui-dialog-contents' : '.ui-dialog-contents',
			dialogBtn: selector ? selector + ' [data-popup-trigger]' : '[data-popup-trigger]',
			fold: selector ? selector + ' .js-fold' : '.js-fold',
			rating: selector ? selector + ' .js-rating' : '.js-rating',
			spinner: selector ? selector + ' .js-spinner' : '.js-spinner',
		};

		setTableCaption(initSelector.tableCaption);
		setUITabs(initSelector.tab);
		setUIDialog(initSelector.dialogBtn, initSelector.dialog);
		setFoldBox(initSelector.fold);
		setStarRating(initSelector.rating);
		setUISpinner(initSelector.spinner);
	}

	// s : Public 접근 가능한 변수 함수로 선언
	_front.setTableCaption = setTableCaption;
	_front.setUITabs = setUITabs;
	_front.setUIDialog = setUIDialog;
	_front.setUIDialogCallback = setUIDialogCallback;
	_front.setFoldBox = setFoldBox;
	_front.setMarquee = setMarquee;
	_front.setYoutubeIFrame = setYoutubeIFrame;
	_front.setVimeoIframe = setVimeoIframe;
	_front.setUITabsSwiper = setUITabsSwiper;
	_front.setSearchEventFilter = setSearchEventFilter;
	_front.setSearchProdFilter = setSearchProdFilter;
	_front.setFilter = setFilter;
	_front.setDetailContent = setDetailContent;
	_front.setStickyMoction = setStickyMoction;
	_front.setStartTransition = setStartTransition;
	_front.showLoadingPopup = showLoadingPopup;
	_front.hideLoadingPopup = hideLoadingPopup;
	_front.attachLoading = attachLoading;
	_front.detachLoading = detachLoading;
	_front.setStarRating = setStarRating;
	_front.initUI = initUI;
	// e : Public 접근 가능한 변수 함수로 선언

	$(window).on('orientationChange', function () {
		if (_isMacLike) {
			_vh = (window.innerHeight + 1);
			_resizeVh = (window.innerHeight + 1);
			document.documentElement.style.setProperty('--vh', _vh + 'px');
			document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
		} else if (_isAndroid) {
			_vh = window.outerHeight;
			_resizeVh = window.outerHeight;
			document.documentElement.style.setProperty('--vh', _vh + 'px');
			document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
		}

	});

	$(document).on("touchstart", function (e) {
		_fisHeight = window.innerHeight;
	});

	clearTimeout($(document).data('scrollEnd'));
	$(document).on('scroll', function (event) {
		$(document).data('scrollEnd', setTimeout(function () {
			if (_isMacLike && window.innerHeight !== _fisHeight) {
				_resizeVh = (window.innerHeight + 1);
				document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
			} else if (_isAndroid && window.outerHeight !== _fisHeight) {
				_resizeVh = window.outerHeight;
				document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
			}
		}, event));

	});

	$(window).on('load', function (event) {
		/* s : 맥 OS 또는 iOS / android 디바이스 체크 */
		_isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
		_isAndroid = /Android/i.test(navigator.userAgent);

		if (_isMacLike) {
			$('html').addClass('os-apple');
			_vh = (window.innerHeight + 1);
			_resizeVh = (window.innerHeight + 1);
			document.documentElement.style.setProperty('--vh', _vh + 'px');
			document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
		} else if (_isAndroid) {
			$('html').addClass('os-android');
			_vh = window.outerHeight;
			_resizeVh = window.outerHeight;

			document.documentElement.style.setProperty('--vh', _vh + 'px');
			document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
		}
		/* e : 맥 OS 또는 iOS / android 디바이스 체크 */
	});

	$(document).ready(function (event) {
		// datepicker Default
		$.datepicker.setDefaults({
			selectOtherMonths: true,
			showOtherMonths: true,
			numberOfMonths: 1,
			yearSuffix: ' .',
			dateFormat: 'yy-mm-dd',
			monthNames: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
			dayNamesMin: ['SU', 'MO', 'TH', 'WE', 'TH', 'FR', 'SA'],
			showMonthAfterYear: true,
			showOn: 'button',
			buttonImage: '/resources/images/ui/button/ui_btn_calendar.png',
			buttonImageOnly: false,// 수정 웹접근성 관련
			buttonText: 'Select date',
			currentText: 'Now',
			prevText: '이전달',
			nextText: '다음달'
		});

		if (window.ScrollPosStyler) {
			ScrollPosStyler.init({
				classAbove: 'sps-abv',
				classBelow: 'sps-blw',
			});
		}


		// 공통 UI 스크립트
		initUI();
		setYoutubeAPITag();
		setbottomFixNav();

		clearTimeout($(this).data('timer'));
		setStartTransition(false);

		$(this).data('timer', setTimeout(function () {
			setStartTransition(true);
		}, 1000, event));


	});

	return _front;
})();

function onYouTubeIframeAPIReady() {
	var event;
	$('html').addClass('youtube-ready');
	event = new CustomEvent('youtubeReady');
	window.dispatchEvent(event);
	// console.log('youtubeReady');
	/*
	if ($('html').hasClass('youtube-ready')) {
		handsome.ui.front.setYoutubeIFrame();
	}
	else {
		$(window).one('youtubeReady', function () {
			handsome.ui.front.setYoutubeIFrame();
		});
	}
	*/
	// handsome.ui.front.setYoutubeIFrame();
}

$(document).ready(function(){
	var standalone = window.navigator.standalone,
		userAgent = window.navigator.userAgent.toLowerCase(),
		safari = /safari/.test(userAgent),
		ios = /iphone|ipod|ipad/.test(userAgent);
	
    if (ios) {
		document.body.classList.add('ios');

		if (!standalone && safari) {
			//browser
			document.body.classList.add('safari');

			$('.ui-dialog-contents[data-class="dialog-full"]').off('blur.fixfocus').on('blur.fixfocus', 'input[type=text], input[type=password], input[type=number], input[type=search], textarea',function (e) {				
				setTimeout(function () {
					var _resizeVh = (window.outerHeight + 1);
					document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
				}, 500);
			});
		} 
		else if (standalone && !safari) {
			//standalone
			document.body.classList.add('standalone');
			fixFocus();
		} 
		else if (!standalone && !safari) {
			//uiwebview
			document.body.classList.add('webview');
			fixFocus();
		};
	}
	else {
		//not iOS
	};

	function fixFocus() {
		// $('input[type=text], input[type=password], input[type=number], input[type=search], textarea', $('.ui-dialog-contents[data-class="dialog-full"]')).each(function () {
			$('.ui-dialog-contents[data-class="dialog-full"]').off('focus.fixfocus').on('focus.fixfocus', 'input[type=text], input[type=password], input[type=number], input[type=search], textarea',function (e) {
				$(this).closest('.ui-dialog-container').css({
					'position': 'absolute',
                    'top': Math.abs(parseInt($('body').css('top'))) + 'px'
                });
			});

			// $(this).off('blur.fixfocus').on('blur.fixfocus', function (e) {
			$('.ui-dialog-contents[data-class="dialog-full"]').off('blur.fixfocus').on('blur.fixfocus', 'input[type=text], input[type=password], input[type=number], input[type=search], textarea',function (e) {				
				var that = $(this);
				window.scrollBy(0, 1);
				setTimeout(function () {
					window.scrollBy(0, -1);

					if ($("body")[0].style.removeProperty) {
						$("body")[0].style.removeProperty('padding-top');
                        $("body")[0].style.removeProperty('box-sizing');
                        // $("body")[0].style.removeProperty('height');
					} else {
						$("body")[0].style.removeAttribute('padding-bottom');
                        $("body")[0].style.removeAttribute('box-sizing');
                        // $("body")[0].style.removeAttribute('height');
					}
					
					that.closest('.ui-dialog-container').css({
						'position': 'fixed',
						'top': '0'
                    });
                }, 500);
                
                var _resizeVh = (window.outerHeight + 1);
				document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
			});
        // });
        
        $(window).off('scroll.fixfocus').on('scroll.fixfocus', function (event) {
            setTimeout(function(){
                var _resizeVh = (window.outerHeight + 1);
                document.documentElement.style.setProperty('--reVh', _resizeVh + 'px');
            }, 500);
        });
	}
});