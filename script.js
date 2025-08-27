document.addEventListener('DOMContentLoaded', function() {


    // Validation simple du formulaire de contact
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Empêche l'envoi réel du formulaire


            const nom = document.getElementById('nom').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;


            if (nom.trim() === '' || email.trim() === '' || message.trim() === '') {
                alert('Veuillez remplir tous les champs.');
            } else {
                // Afficher le message de succès
                const formMessage = document.getElementById('form-message');
                formMessage.style.display = 'block';


                // Cacher le formulaire
                contactForm.style.display = 'none';
            }
        });
    }


});