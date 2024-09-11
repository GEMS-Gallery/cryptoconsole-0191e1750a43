import { backend } from 'declarations/backend';

const content = document.getElementById('content');
const commandInput = document.getElementById('command-input');

let posts = [];

async function fetchPosts() {
    try {
        posts = await backend.getPosts();
        displayPosts();
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function displayPosts() {
    content.innerHTML = '';
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <span class="post-title">${post.title}</span>
            <span class="post-timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</span>
        `;
        content.appendChild(postElement);
    });
}

async function displayPost(id) {
    try {
        const post = await backend.getPost(id);
        if (post) {
            content.innerHTML = `
                <div class="post">
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <span class="post-timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</span>
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
    try {
        const id = await backend.createPost(title, content);
        console.log('Post created with ID:', id);
        await fetchPosts();
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

commandInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const command = commandInput.value.trim();
        commandInput.value = '';

        if (command.startsWith('create ')) {
            const [_, title, ...contentParts] = command.split(' ');
            const content = contentParts.join(' ');
            await createPost(title, content);
        } else if (command.startsWith('view ')) {
            const id = parseInt(command.split(' ')[1]);
            await displayPost(id);
        } else if (command === 'list') {
            await fetchPosts();
        } else {
            content.innerHTML = 'Unknown command. Available commands: create [title] [content], view [id], list';
        }
    }
});

fetchPosts();

// Add blinking cursor effect
setInterval(() => {
    commandInput.style.borderRight = commandInput.style.borderRight ? '' : '10px solid #00FF00';
}, 500);
