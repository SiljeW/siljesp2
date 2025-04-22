import { createPet } from "../utils/pets/index";

export function setCreatePetFormListener() {
  const form = document.querySelector('.pet-form');

  if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault()
        const form = event.target;
        const formData = new FormData(form);
        const pet = Object.fromEntries(formData.entries())
    
      createPet(pet)
    })
  }
}