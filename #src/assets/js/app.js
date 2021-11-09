$(".default__option").click(function () {
	$(this).parent().toggleClass("active");
})

$(".select__ul li").click(function () {
	var currentele = $(this).html();
	$(".default__option li").html(currentele);
	$(this).parents(".select").removeClass("active");
});