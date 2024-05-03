function debounce(func, timeOut){
    let timerId;

    return function(...args){
        return new Promise((resolve, reject) => {
            clearTimeout(timerId);
            timerId = setTimeout(() => {
                try{
                    const result = func.apply(this, args);
                    resolve(result)
                }catch(error){
                    reject(error)
                }
            }, timeOut)
        })
    }
}

function debounceInput(callee, timeoutMs) {
    return function perform(...args) {
      let previousCall = this.lastCall
  
      this.lastCall = Date.now()
  
      if (previousCall && this.lastCall - previousCall <= timeoutMs) {
        clearTimeout(this.lastCallTimer)
      }
  
      this.lastCallTimer = setTimeout(() => callee(...args), timeoutMs)
    }
}


async function getOptions(searchKey){
    try{
        const response = await fetch(`https://api.github.com/search/repositories?q=${searchKey}&per_page=5`, {
            method: 'get',
            headers: {
                Authorization: '',
                'X-GitHub-Api-Version': '2022-11-28'
    
            }
        });
        return response.json();
    }catch(error){
        console.assert("Проблемы с сервером ! Повторите попытку")
        return error;
    }
}

function clearOptionsList(){
    const optionsElement = document.querySelector('.repositories-options');

    if (optionsElement.firstElementChild){
        while(optionsElement.firstElementChild){
            optionsElement.firstChild.remove();
        }
    }
}

function createOptionElement(repoData){
    const optionsElement = document.querySelector('.repositories-options');

    clearOptionsList();

    optionsElement.classList.add('repositories-options--active');
    repoData.items.forEach(repo => {
        const optionElement = document.createElement('li');
        optionElement.textContent = repo.name;
        optionElement.classList.add('repositories-option');
        optionsElement.appendChild(optionElement);            
        optionElement.addEventListener('click', () => {
            addRepository(repo);
            clearInputAfterCreate()
        });
    });
};

function clearInputAfterCreate(){
    const input = document.querySelector('.repositories-input');
    input.value = '';
    disableOptionsList();
};

function deleteRepo(repoElem){
    repoElem.removeEventListener('click', deleteRepo);
    repoElem.remove();
};

function addRepository(repoData){
    const savedListElement = document.querySelector('.saved-list');
    const repoElem = document.createElement('li');
    repoElem.classList.add('saved-item');
    const repoButton = document.createElement('button');
    repoButton.addEventListener('click', () => {
        deleteRepo(repoElem);
    });
    repoButton.classList.add('saved-close');    
    const repoInfo = document.createElement('div');
    repoInfo.classList.add('info');
    repoElem.appendChild(repoInfo);
    repoElem.appendChild(repoButton);
    const repoName = document.createElement('div');
    repoName.classList.add('info-name');
    repoName.textContent = `Name: ${repoData.name}`;
    const repoOwner = document.createElement('div');
    repoOwner.classList.add('info-owner');
    repoOwner.textContent = `Owner: ${repoData.owner.login}`;
    const repoStars = document.createElement('div');
    repoStars.textContent = `Stars: ${repoData.watchers_count}`;
    repoStars.classList.add('info-stars');
    repoInfo.appendChild(repoName);
    repoInfo.appendChild(repoOwner);
    repoInfo.appendChild(repoStars);
    savedListElement.appendChild(repoElem);
};

function disableOptionsList(){
    const optionsElement = document.querySelector('.repositories-options');
    optionsElement.classList.add('repositories-options--disable');
    clearOptionsList(); 
}

async function handleInput(event){
    const value = event.target.value;
    if (value && value.trim().length > 0){
        const optionsElement = document.querySelector('.repositories-options');
        optionsElement.classList.remove('repositories-options--disable');
        let repoList = await debounceGetOptions(event.target.value);
        createOptionElement(repoList);
    };
};

const debounceGetOptions = debounce(getOptions, 1000);
const debouncehandleInput = debounceInput(handleInput, 400);

const input = document.querySelector('.repositories-input');

input.addEventListener('input', async function(event){  
    debouncehandleInput(event);

    if (!event.target.value){
        disableOptionsList();
    }
})
