import { updatePet } from "../utils/pets/index.mjs";
export async function setUpdatePetFormListener() {
    const form = document.getElementById('editListingModal');

    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');

    if (form) {
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;

        const pet = await getPet(id);

        form.title.valueOf = pet.title;
        form.body.value = pet.body;
        form.tags.value = pet.tags;
        form.media.value = pet.media;

        button.disabled = false;

        form.addEventListener('submit', (event) => {
            event.preventDefault()
            const form = event.target;
            const formData = new FormData(form);
            const pet = Object.fromEntries(formData.entries())
            pet.id = id;
    
            updatePet(pet)
        })
    }
}