import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { backend } from 'declarations/backend';

const content = document.getElementById('content');
const commandInput = document.getElementById('command-input');
const authButton = document.getElementById('auth-button');

let authClient;
let actor;
let isAuthenticated = false;

async function initAuth() {
    authClient = await AuthClient.create();
    isAuthenticated = await authClient.isAuthenticated();
    updateAuthButton();

    if (isAuthenticated) {
        initActor();
    }
}

function updateAuthButton() {
    authButton.textContent = isAuthenticated ? 'Logout' : 'Login';
}

async function handleAuth() {
    if (isAuthenticated) {
        await authClient.logout();
        isAuthenticated = false;
        actor = null;
    } else {
        await authClient.login({
            identityProvider: 'https://identity.ic0.app/',
            onSuccess: () => {
                isAuthenticated = true;
                initActor();
            }
        });
    }
    updateAuthButton();
}

function initActor() {
    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    actor = Actor.createActor(backend.idlFactory, {
        agent,
        canisterId: backend.canisterId,
    });
}

async function fetchPosts() {
    if (!isAuthenticated) {
        content.innerHTML = 'Please login to view posts.';
        return;
    }
    try {
        const posts = await actor.getPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function displayPosts(posts) {
    content.innerHTML = '';
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <span class="post-title">${post.title}</span>
            <span class="post-timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</span>
            <span class="post-author">${post.author.toText()}</span>
        `;
        content.appendChild(postElement);
    });
}

async function displayPost(id) {
    if (!isAuthenticated) {
        content.innerHTML = 'Please login to view posts.';
        return;
    }
    try {
        const post = await actor.getPost(id);
        if (post) {
            content.innerHTML = `
                <div class="post">
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <span class="post-timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</span>
                    <span class="post-author">${post.author.toText()}</span>
                </div>
            `;
        } else {
            content.innerHTML = 'Post not found.';
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        content.innerHTML = 'Error fetching post.';
    }
}

async function createPost(title, content) {
    if (!isAuthenticated) {
        console.error('User not authenticated');
        return;
    }
    try {
        const id = await actor.createPost(title, content);
        console.log('Post created with ID:', id);
        await fetchPosts();
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

async function fetchICPPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd');
        const data = await response.json();
        const price = data['internet-computer'].usd;
        content.innerHTML = `Current ICP price: $${price}`;
    } catch (error) {
        console.error('Error fetching ICP price:', error);
        content.innerHTML = 'Error fetching ICP price.';
    }
}

function displayIdentity() {
    if (!isAuthenticated) {
        content.innerHTML = 'Please login to view your identity.';
        return;
    }
    const identity = authClient.getIdentity();
    const principal = identity.getPrincipal();
    content.innerHTML = `Your principal ID: ${principal.toText()}`;
}

commandInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const command = commandInput.value.trim();
        commandInput.value = '';

        if (!isAuthenticated && command !== 'icp' && command !== 'identity') {
            content.innerHTML = 'Please login to use commands.';
            return;
        }

        if (command.startsWith('create ')) {
            const [_, title, ...contentParts] = command.split(' ');
            const postContent = contentParts.join(' ');
            await createPost(title, postContent);
        } else if (command.startsWith('view ')) {
            const id = parseInt(command.split(' ')[1]);
            await displayPost(id);
        } else if (command === 'list') {
            await fetchPosts();
        } else if (command === 'icp') {
            await fetchICPPrice();
        } else if (command === 'identity') {
            displayIdentity();
        } else {
            content.innerHTML = 'Unknown command. Available commands: create [title] [content], view [id], list, icp, identity';
        }
    }
});

authButton.addEventListener('click', handleAuth);

initAuth();

// Add blinking cursor effect
setInterval(() => {
    commandInput.style.borderRight = commandInput.style.borderRight ? '' : '10px solid #00FF00';
}, 500);
