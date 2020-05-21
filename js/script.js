const usersURL = 'https://randomuser.me/api/?nat=gb&results=12';
const $gallery = $('#gallery');
const $body = $('body');
let userList = [];
let filteredUserList = [];
let filteredUserCards = [];


// ------------------------------------------
//  FETCH FUNCTIONS
// ------------------------------------------

/**
 *  Fetches Data from an API and parse it to json format.
 * @param   url to an API
 * @return  Promise
 */
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

/**
 *  Checks if a API call was successful or not and gives the right promise as a return.
 * @param   response
 * @return  Promise
 */
function checkStatus (response) {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error (response.statusText));
    }
}

/**
 *  Renders the Page with users and the searchbar. Adds An eventlistener to open the modal
 * @param   data with users
 */
function generateUserInfos(data) {
    let html = "";
    userList = data;

    data.map( (user, index) => {
        const name = user.name.first + " " + user.name.last;
        html += `
        <div class="card" id="${index}">
            <div class="card-img-container">
                <img class="card-img" src="${user.picture.large}" alt="profile picture">
            </div>
            <div class="card-info-container">
                <h3 id="name" class="card-name cap">${name}</h3>
                <p class="card-text">${user.email}</p>
                <p class="card-text cap">${user.location.city}, ${user.location.state}</p>
            </div>
        </div>
        `
    });

    $gallery.append(html);

    $(".card").on('click', function () {
        const id = $(this).attr('id');
        let user = userList[id];
        let index = userList.indexOf(userList[id]);

        if(filteredUserList.length > 0) {
            index = filteredUserList.indexOf(user);
        }

        showInfoForUser(user, index);
    });

    appendSearchBar();
}

/**
 *  Renders the modal with the additional user infos. With Eventlisteners for closing the Modal and navigate through the
 *  Users
 * @param   user data
 * @param index
 */
function showInfoForUser(user, index) {
    const date = new Date(user.dob.date);
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    const birthday = `${da}/${mo}/${ye}`;
    const name = user.name.first + " " + user.name.last;
    const modalList = getListForModal();

    let html = `
        <div class="modal-container">
                <div class="modal">
                    <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
                    <div class="modal-info-container">
                        <img class="modal-img" src="${user.picture.large}" alt="profile picture">
                        <h3 id="name" class="modal-name cap">${name}</h3>
                        <p class="modal-text">${user.email}</p>
                        <p class="modal-text cap">${user.location.city}</p>
                        <hr>
                        <p class="modal-text">${user.cell}</p>
                        <p class="modal-text">${user.location.street.name} ${user.location.street.number}, ${user.location.state}, ${user.location.postcode}</p>
                        <p class="modal-text">Birthday: ${birthday}</p>
                    </div>
                </div>

                <div class="modal-btn-container">
                    <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
                    <button type="button" id="modal-next" class="modal-next btn">Next</button>
                </div>
            </div>
    `;

    $body.append(html);

    const $modalBtnContainer = $('.modal-btn-container');
    const $modalPrev = $('#modal-prev');
    const $modalNext = $('#modal-next');

    setModalNavigation(index, modalList, $modalBtnContainer, $modalPrev, $modalNext);

    $modalNext.on('click', () => {
        $('.modal-container').remove();
        const nextIndex = index + 1;
        let nextUser = modalList[nextIndex];
        showInfoForUser(nextUser, nextIndex);
    });

    $modalPrev.on('click', () => {
        $('.modal-container').remove();
        let prevIndex = index - 1;
        let prevUser = modalList[prevIndex];
        showInfoForUser(prevUser, prevIndex);
    });


    $('#modal-close-btn')
        .on('click', () => $('.modal-container').remove());

    $('.modal-container')
        .on('click', (e) => {
            if($(e.target).hasClass('modal-container')) {
                $(e.target).remove();
            }
    });
}

/**
 *  Checks if there is a filtered List available or not
 * @return user list or filtered user list
 */
const getListForModal = () => {
    if(filteredUserList.length > 0) {
        return filteredUserList;
    } else {
        return userList;
    }
};

/**
 *  Set the Navigation Buttons in the Modal. Checks if its the first or the last one to show the right buttons.
 * @param index of the list
 * @param list
 * @param element
 * @param prevBtn
 * @param nextBtn
 */
const setModalNavigation = (index, list, element, prevBtn, nextBtn) => {
    element.show();
    prevBtn.show();
    nextBtn.show();

    if(index === 0) {
        prevBtn.hide();
    }
    if(index === (list.length -1)) {
        nextBtn.hide();
    }
    if(list.length === 1) {
        element.hide();
    }
};


/**
 *  Render the search input field and adding the functionality to search users with an event listener
 */
const appendSearchBar = () => {
    const allUsers = $('.card');

    const html = `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
    </form>
    `;

    const $searchContainer = $('.search-container');
    $searchContainer.append(html);

    const divNoResult = createNoResultDiv();
    const input = document.querySelector('#search-input');

    input.addEventListener('keyup', (e) => {
        divNoResult.style.display = "none";
        let name = e.target.value.toLowerCase();
        filteredUserCards = [];
        filteredUserList = [];
        for (let i = 0; i < allUsers.length; i++) {
            let userName = allUsers[i].querySelector('h3').textContent.toLowerCase();
            allUsers[i].style.display = "none";
            if (userName.includes(name)) {
                allUsers[i].style.display = "flex";
                filteredUserCards.push(allUsers[i]);
                filteredUserList.push(userList[i]);
            }
        }
        showNoResult(filteredUserCards, divNoResult);
    });

    input.addEventListener('search', (e) => {
        divNoResult.style.display = "none";
        $('.card').css("display", "flex");
        filteredUserCards = [];
        filteredUserList = [];
    });
};


/**
 *  creates a div with the info no result
 *  @return no result div
 */
const createNoResultDiv = () => {
    const divNoResult = document.createElement('div');
    divNoResult.className = "no-result";
    divNoResult.style.display = "none";
    divNoResult.textContent = "No User found with your Search-Input";

    const $searchContainer = $('#gallery');
    $searchContainer.append(divNoResult);
    return divNoResult;
};


/**
 *  checks if there are no results and show the no result div
 *  @param list
 *  @param element
 */
const showNoResult = (list, element) => {
    if (!list.length) {
        element.style.display = "block";
    }
};


