const cafeList = document.querySelector('#cafe-list');

const form = document.querySelector('#add-cafe-form');
// Créer un élément et afficher la liste des cafés
function renderCafe(doc) {
    let li = document.createElement('li');
    let name = document.createElement('span');
    let city = document.createElement('span');
    // btn de suppression
    let cross = document.createElement('div');

    li.dataset.id = doc.id;
    name.textContent = doc.data().name;
    city.textContent = doc.data().city;
    cross.textContent = 'X';
    li.appendChild(name);
    li.appendChild(city);
    li.appendChild(cross);

    cafeList.appendChild(li);

    // On rettache l'évènement supp à chaque élément au click sur la croix

    cross.addEventListener('click', (e) => {
        e.stopPropagation() // on arrête la propagation de l'évènement déclenché
        // On récupère l'identifiant du parent de l'élément qui à déclencher l'évènement
        let id = e.target.parentElement.dataset.id;
        // On récupére dans notre collection le document ayant l'id correspondant, on le supprime
        db.collection('cafes').doc(id).delete().then(() => {
            console.log('La suppréssion a été réalisée avec succès !');
        })
    })


}

// Récupération des données de notre collection
// const cafes = db.collection('cafes').get(); 
// On va ajouter une clause where
// const cafes = db.collection('cafes').where('city', '==', 'Marioland').get(); // retourne une promesse
// snapshot est la représentation des différents objets de notre collection
// on récupère les données triées par préférence
// const cafes = db.collection('cafes').where('city', '==', 'Marioland').orderBy('name').get(); // /!\ pour ce type de requête, il faut créer un index composite sur les deux champs, sinon ça ne fonctionne pas!
// cafes.then((snapshot) => {
// Pour accéder aux données, on doit recupérer chaque document pour extraire ses données
// snapshot.forEach(doc => {
//     renderCafe(doc);
// })
// }) ==> pour faire real-time snapshot listener

// Persister des données dans notre collection

form.addEventListener('submit', (e) => { // On écoute l'évènement submit sur le formulaire
    e.preventDefault(); // On empêche le refraîchissement de la page (comportement par defaut)
    // On ajoute le contenu du formulaire à la collection
    let name = form.name.value;
    let city = form.city.value;
    if (name && city) {
        db.collection('cafes').add({
            name: name,
            city: city
        }).then(() => {
            // On vide les champs du formulaire
            form.name.value = '';
            form.city.value = '';
            console.log('Enrégistrement réussi')
        })
    }
});

// le real-time snapshot listener

db.collection('cafes').orderBy('city').onSnapshot(snapshot => {
    // on écoute les changements dans le document firestore
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        // si le type de change est added, on l'inserer dans le DOM, sinon on le retire du DOM
        if (change.type == 'added') {
            renderCafe(change.doc);
        } else if (change.type == 'removed') {
            // on sélectionne les éléments ayant leur data-id == l'id des éléments supp de la collection
            let li = cafeList.querySelector('[data-id=' + change.doc.id + ']');
            // on le supp de la liste
            cafeList.removeChild(li);
        }
    })
})