export const API_BASE_URL = 'https://v2.api.noroff.dev';
export const API_PETS_URL = `${API_BASE_URL}/pets`;

export function getPetsUrl(name, id) {
  var urlBase = `${API_PETS_URL}/${name}`;
  if (id !=null) {
      return `${urlBase}/${id}`;
  }
  return urlBase;
}