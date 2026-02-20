export const slugify = (text: string) => {
	const rus =
		"щ  ш  ч  ц  ю  я  ё  ж  ъ  ы  э  а  б  в  г  д  е  з  и  й  к  л  м  н  о  п  р  с  т  у  ф  х".split(
			/ +/
		);
	const eng =
		"shh sh ch cz yu ya yo zh `` y  e  a  b  v  g  d  e  z  i  j  k  l  m  n  o  p  r  s  t  u  f  h".split(
			/ +/
		);

	let result = text.toLowerCase();

	rus.forEach((char, i) => {
		result = result.replaceAll(char, eng[i] ?? "");
	});

	return result
		.replace(/[^\w\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
};
