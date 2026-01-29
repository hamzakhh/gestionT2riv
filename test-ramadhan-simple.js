// Test simple pour vérifier l'API Ramadhan
const testRamadhanAPI = async () => {
  try {
    console.log('Test API Ramadhan...');
    
    // Test GET /ramadhan
    const response = await fetch('http://localhost:5000/api/ramadhan', {
      headers: {
        'Authorization': 'Bearer VOTRE_TOKEN_ICI',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API fonctionne:', data.success);
      console.log('📊 Nombre de donations:', data?.data?.length || 0);
      
      // Afficher les champs des premières donations
      if (data?.data?.length > 0) {
        console.log('🔍 Champs de la première donation:', Object.keys(data.data[0]));
        console.log('📅 Date format:', data.data[0].donationDate);
      }
    } else {
      console.log('❌ Erreur API:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

// Pour tester dans la console du navigateur:
// 1. Ouvrir l'application
// 2. Ouvrir la console développeur
// 3. Coller et exécuter cette fonction
// 4. Appeler testRamadhanAPI()

export default testRamadhanAPI;
