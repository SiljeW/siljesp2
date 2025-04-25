import { getPetById } from "../utils/pets/index";
import { getAllPets } from "../utils/pets/index";
export function setGetPetFormListener() {
    const form = document.getElementById('pet-card');

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault()
            const form = event.target;
            const formData = new FormData(form);
            const pet = Object.fromEntries(formData.entries())
    
            getPetById(pet)
        })
    }
}

export function setGetAllPetsFormListener() {
    const form = document.getElementById('pet-card');

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault()
            const form = event.target;
            const formData = new FormData(form);
            const pets = Object.fromEntries(formData.entries())
    
            getAllPets(pets)
        })
    }
}