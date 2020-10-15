$(document).ready(function () {
	//s : 하단띠 배너 위치
	var scrollPos = $(window).scrollTop() || 0;
	$(window).scroll(function(event){ 
		var documentY = $(this).scrollTop()
		var direction = documentY - scrollPos
		 if(direction>=0){
			//다운
			$('.special-banner-wrap').removeClass('up');
		 }else{
			//업
			$('.special-banner-wrap').addClass('up');
		 }
		 scrollPos = documentY;
	});
	//e : 하단띠 배너 위치

	//s : 하단띠 배너 닫기
	$('.special-banner-wrap .close').click(function(e){
		$('.special-banner-wrap').removeClass('show');
		e.preventDefault();
	});

	//s : 개인화 팝업 열기
	$('.main-personalize-banner').filter(function(){
		if($(this).hasClass('show')){
			$('body').addClass('dialog-open');
		}
	})
	$('.main-personalize-banner .bbtn').click(function(e){
		$('.main-personalize-banner').removeClass('show');
		$('body').removeClass('dialog-open');
		e.preventDefault();
	});
	//e : 개인화 팝업 열기

	//s : 개인화 팝업 스텝 플로우
	/**
	 * 디자인 검수시 화면 노출하려 작업함.
	 * 개발 불필요시 삭제해도 무관
	 * 스텝1 .brand-select-wrap.step01
	 * 스텝2 .brand-select-wrap.step02
	 * 스텝3 .brand-select-wrap.step03
	 * addClass step0(N) 
	 **/
	var stepDiv = 0;
	$('.brand-select-wrap .gender-select-item').click(function(){
		if(stepDiv==0){
			$('.brand-select-wrap').removeClass('step01');
			$('.brand-select-wrap').addClass('step02');
			$('.brand-select-wrap .brand-select-list').addClass('show');
		}
		stepDiv = 1;
	});
	//키워드 선택시
	$(document).on('click','.step02 .key-select .brand-select-item',function(){
		var chkLength = $('.step02 .key-select input:checkbox:checked').length
		if(chkLength >= 5){
			$('.btn-even-wrap .next').addClass('off');
		}else{
			$('.btn-even-wrap .next').removeClass('off');
			if(chkLength > 0){
				$('.btn-even-wrap .num').text('0'+chkLength)
			}else{
				$('.btn-even-wrap .num').text('')
			}
		}
	});
	//이전버튼
	$('.pbtn.prev').click(function(){
		$('.brand-select-wrap').removeClass('step03');
		$('.brand-select-wrap').addClass('step02');
	});
	//다음버튼
	$('.pbtn.next2').click(function(){
		$('.brand-select-wrap').removeClass('step02');
		$('.brand-select-wrap').addClass('step03');
	});
	//e : 개인화 팝업 스텝 플로우

	/**
	 * 투데이 
	**/

	//월테마 롤링
	themeSwiper = new Swiper('.theme-banner-wrap', {
		init: false,
		slidesPerView: 1,
		spaceBetween: 0,
		speed: 600,
		loop: true,
		// autoplay: {
		// 	delay: 3000,
		// },
		on: {
			init: function() {
				var totalNum = $('.main-visual-banner-wrap .swiper-slide').not('.swiper-slide-duplicate').length;
				$(this.$el).find('.swiper-page-number .total').text(totalNum);
				$(this.$el).find('.swiper-page-number .current').text(( this.realIndex + 1 ));
			},
			slideChange: function() {
				$(this.$el).find('.swiper-page-number .current').text(( this.realIndex + 1 ));
			}
		},
	});
	themeSwiper.init();

	//룩북 롤링
	if ($('.lbook-banner-wrap .swiper-slide').length > 1) {
		lbookSwiper = new Swiper('.lbook-banner-wrap', {
			init: false,
			slidesPerView: 'auto',
			spaceBetween: 0,
			speed: 600,
		});
		lbookSwiper.init();
	}
	

	//인플루언서 롤링
	if ($('.inssa-banner-wrap .swiper-slide').length > 1) {
		inssaSwiper = new Swiper('.inssa-banner-wrap', {
			init: false,
			slidesPerView: 'auto',
			spaceBetween: 0,
			speed: 600,
		});
		inssaSwiper.init();
	}

	//상품 롤링
	if ($('.prd-banner-wrap .swiper-slide').length > 1) {
		prdSwiper = new Swiper('.prd-banner-wrap', {
			init: false,
			slidesPerView: 'auto',
			spaceBetween: 0,
			speed: 600,
		});
		prdSwiper.init();
	}

	//텍스트베너 
	var descTheme = $('.desc-theme span')
	var descThemeLength = descTheme.text().length*0.15
	descTheme.css('animation',descThemeLength+'s');
	$('.m-theme-wrap .title-today .arrow').click(function(){
		$(this).closest('.m-theme-wrap').toggleClass('on')
	});

	//브랜드 리스트
	$(window).on('scroll',function() {
		$('.swiper-slide-active .brand-list').each(function(){
			if(checkVisible($(this))){
				$('.brand-list').addClass('on');
			}
			
		});
	});
});

function checkVisible( elm, eval ) {
	eval = eval || "object visible";
	var viewportHeight = $(window).height(), // Viewport Height
		scrolltop = $(window).scrollTop(), // Scroll Top
		y = $(elm).offset().top,
		elementHeight = $(elm).height();   
	
	if (eval == "object visible") return ((y < (viewportHeight + scrolltop)) && (y > (scrolltop - elementHeight)));
	if (eval == "above") return ((y < (viewportHeight + scrolltop)));
}
