export function petTemplateA(petData) {
  return `<div class="pet" id=${petData.id}>${petData.title}</div>`
}

export function petTemplateB(petData) {
  const pet = document.createElement("div")
  pet.classList.add("pet");
  pet.innerText = petData.title;

  if (petData.media) {
    const img = document.createElement('img');
    img.src = petData.media;
    img.alt = petData.title;
    pet.append(img);
  }

  return pet;
}

export function renderPetTemplate(petData, parent) {
  parent.append(petTemplateB(petData));
}

export function renderPetTemplates(petsDataList, parent) {
  parent.append(...petsDataList.map(petTemplateB));
}