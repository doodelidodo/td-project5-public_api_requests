const usersURL = 'https://randomuser.me/api/?nat=gb&results=12';
const $gallery = $('#gallery');
const $body = $('body');
let userList = [];


// ------------------------------------------
//  FETCH FUNCTIONS
// ------------------------------------------

function fetchData(url) {
    return fetch(url)
        .then(checkStatus)
        .then(response => response.json())
        .catch(error => console.log('Looks like there was a problem', error));
}

fetchData(usersURL)
    .then(data => generateUserInfos(data.results));

// ------------------------------------------
//  HELPER FUNCTIONS
// ------------------------------------------

function checkStatus (response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error (response.statusText));
    }
}

function generateUserInfos(data) {
    let html = "";
    userList = data;
    data.map( (user, index) => {
        html += `
        <div class="card" id="${index}">
            <div class="card-img-container">
                <img class="card-img" src="${user.picture.medium}" alt="profile picture">
            </div>
            <div class="card-info-container">
                <h3 id="name" class="card-name cap">${user.name.first} ${user.name.last}</h3>
                <p class="card-text">${user.email}</p>
                <p class="card-text cap">${user.location.city}, ${user.location.state}</p>
            </div>
        </div>
        `
    });
    $gallery.append(html);

    $(".card").on('click', function () {
        const user = userList[$(this).attr('id')];
        showInfoForUser(user);
    });
}

function showInfoForUser(user) {
    const date = new Date(user.dob.date);
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    const birthday = `${da}/${mo}/${ye}`;
    let html = `
        <div class="modal-container">
                <div class="modal">
                    <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
                    <div class="modal-info-container">
                        <img class="modal-img" src="${user.picture.medium}" alt="profile picture">
                        <h3 id="name" class="modal-name cap">${user.name.first} ${user.name.last}</h3>
                        <p class="modal-text">${user.email}</p>
                        <p class="modal-text cap">${user.location.city}</p>
                        <hr>
                        <p class="modal-text">${user.cell}</p>
                        <p class="modal-text">${user.location.street.name} ${user.location.street.number}, ${user.location.state}, ${user.location.postcode}</p>
                        <p class="modal-text">Birthday: ${birthday}</p>
                    </div>
                </div>

                // IMPORTANT: Below is only for exceeds tasks 
                <div class="modal-btn-container">
                    <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
                    <button type="button" id="modal-next" class="modal-next btn">Next</button>
                </div>
            </div>
    `;

    $body.append(html);

    $('#modal-close-btn')
        .on('click', () => $('.modal-container').remove());

    $('.modal-container')
        .on('click', (e) => {
            if($(e.target).hasClass('modal-container')) {
                $(e.target).remove();
            }
    });
}



