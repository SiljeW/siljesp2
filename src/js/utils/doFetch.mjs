export async function doFetch(url, options = {}){
  try {
      const headers = {
          'Content-Type': 'application/json',
      };
      const combinedOptions = { headers, ...options };
      const response = await fetch(url, combinedOptions);
      const json = await response.json();
      return json
  }   catch (error) {
      console.log(error);
      throw error;
  }   finally {

  }
}