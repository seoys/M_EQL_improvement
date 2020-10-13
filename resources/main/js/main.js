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

});