function myFunction() {

    let input = document.getElementById('search').value.toUpperCase();
    let bookCard = document.getElementsByTagName('section');

    for (i = 0; i < bookCard.length; i++) {

        txtValue = bookCard[i].getAttribute('name').toUpperCase()

        if (txtValue.indexOf(input) > -1) {
            bookCard[i].style.display = "";
        } else {
            bookCard[i].style.display = "none";
        }
    }

}