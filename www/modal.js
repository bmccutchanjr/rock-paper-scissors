function testModal ()
{
	const wrapper = document.createElement ("div");
	wrapper.setAttribute ("id", "modal-wrapper");

	const section = document.createElement ("section");
//		section.setAttribute ("id", "modal");
	section.innerText = "YIPPEE-KAI-YAY";
	wrapper.append (section);

	document.body.append (wrapper);
}