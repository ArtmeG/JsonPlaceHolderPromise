const http = {
    get(url) {
        try {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);

                xhr.addEventListener('load', () => {
                    resolve(JSON.parse(xhr.responseText));
                });

                xhr.addEventListener('error', (e) => {
                    reject(e);
                })

                xhr.send();
            });

        } catch (e) {
            console.log(e);
        }
    },

    post(url, body) {
        try {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);

                xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')

                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) === 2) {
                        resolve(JSON.parse(xhr.responseText));
                    }
                });

                xhr.addEventListener('error', (e) => {
                    reject(e);
                })

                xhr.send(body);
            });

        } catch (e) {
            console.log(e);
        }
    }
}

// UI
const btn = document.querySelector('.get-users'),
    usrNameContainer = document.querySelector('.user-name'),
    usrInfoContainer = document.querySelector('.user-info'),
    URL = 'http://jsonplaceholder.typicode.com/users',
    form = document.forms['form'];

let objOfUsers = {};

// Events
btn.addEventListener('click', onGetUsersHandler);
usrNameContainer.addEventListener('click', onSelectUsersHandler);
form.addEventListener('submit', onSubmitHandler);

/**
 * Select user handler
 * @param target
 */
function onSelectUsersHandler({target}) {
    if (!target.parentElement.hasAttribute('data-id')) {
        return;
    }
    const userId = target.parentElement.dataset.id;
    renderDataUser(objOfUsers[userId]);
}

/**
 * Get user handler
 */
function onGetUsersHandler() {
    if (!usrInfoContainer.classList.contains("hidden")) {
        usrInfoContainer.classList.add("hidden");
    }
    http.get(URL)
        .then(userDataPreparation)
        .then(() => btn.removeEventListener('click', onGetUsersHandler))
        .catch(error => console.log(error));
}

/**
 * Form submit handler
 * @param e
 */
function onSubmitHandler(e) {
    e.preventDefault();
    renderNewUser();
    this.reset();
}

/**
 * Prepare user data
 * @param users
 */
function userDataPreparation(users) {
    objOfUsers = getObjectOfUsers(users);
    renderAllUsers(objOfUsers);
    usrNameContainer.classList.remove('hidden');
}

/**
 * Get object of users
 * @param obj
 */
function getObjectOfUsers(users) {
    return users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {});
}

/**
 * Render all users
 * @param users
 */
function renderAllUsers(users) {
    if (!users) {
        return;
    }
    usrNameContainer.innerHTML = createFragment(users);
}

/**
 * Prepare fragment for render
 * @param users
 * @returns fragment
 */
function createFragment(users) {
    return Object.values(users).reduce((acc, user) => {
        acc += createListItem(user);
        return acc;
    }, '')
}

/**
 * Create a template of user names
 * @param id
 * @param name
 * @returns {string}
 */
function createListItem({id, name}) {
    return `
        <li data-id=${id}>
                <p>${name}</p>
        </li>
    `;
}

/**
 * Render data of user
 * @param user
 */
function renderDataUser(user) {
    usrInfoContainer.innerHTML = createUserInfo(user);
    usrInfoContainer.classList.remove('hidden');
}

/**
 * Create a teplate of user data
 * @param id
 * @param username
 * @param email
 * @param phone
 * @param website
 * @returns {string}
 */
function createUserInfo({id, username, email, phone, website}) {
    return `
        <li data-id=${id}>
                <p>Username: ${username}</p>
                <p>Email: ${email}</p>
                <p>Phone: ${phone}</p>
                <p>Website: ${website}</p>
        </li>
    `;
}

/**
 * Render a new user
 */
function renderNewUser() {
    const newUser = createNewUser();
    if (!newUser) {
        return;
    }
    http.post(URL, JSON.stringify(newUser))
        .then(user => {
            objOfUsers[user.id] = user;
            usrNameContainer.insertAdjacentHTML('beforeend', createListItem(user));
            usrNameContainer.classList.remove('hidden');
            console.log(objOfUsers);
        })
        .catch(error => console.error(error));
}

/**
 * Create a new user
 * @returns (Object) newUser
 */
function createNewUser() {
    const name = form.elements['name'].value,
        username = form.elements['username'].value,
        email = form.elements['email'].value,
        phone = form.elements['phone'].value,
        website = form.elements['website'].value;

    if (name && username && email) {
        return createNewObjOfUser(name, username, email, phone, website);
    }
}

/**
 * Create an object of user for POST body
 * @param name
 * @param username
 * @param email
 * @param phone
 * @param website
 * @returns (Object) newObjOfUser
 */
function createNewObjOfUser(name, username, email, phone, website) {
    return {
        id: createUUID(),
        name,
        username,
        email,
        phone,
        website
    };
}

/**
 * Create UUID for new task id
 * @returns UUID
 */
function createUUID() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}