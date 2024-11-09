const BACKEND_URL = 'https://forum-dislike-extension.fly.dev';

function getUserId() {
  let userId = localStorage.getItem('piazza_dislikes_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('piazza_dislikes_user_id', userId);
  }
  return userId;
}

// Function to generate a unique ID for each comment or answer
function generateCommentId(element) {
  //get class id
  classId = window.location.pathname.split('/')[2];
  // console.log(window.location.pathname.split('/'));
  
  // For instructor answers
  if (element.matches('article[data-id="i_answer"]')) {
    const postId = window.location.pathname.split('/').pop();
    return `${classId}-${postId}-instructor_answer`;
  }
  
  // For student answers
  if (element.matches('article[data-id="s_answer"]')) {
    const postId = window.location.pathname.split('/').pop();
    return `${classId}-${postId}-student_answer`;
  }
  
  // For instructor notes
  if (element.matches('article#qaContentViewId.main[aria-label="note"]')) {
    const noteId = element.querySelector('.post_number_copy')?.textContent.replace('@', '') || 
                  window.location.pathname.split('/').pop();
    return `${classId}-note-${noteId}`;
  }
  
  // For regular comments
  const postId = element.closest('.post')?.getAttribute('data-id');
  const commentId = element.getAttribute('data-comment-id');
  return `${classId}-${postId}-${commentId}`;
}

// Function to add dislike button to a comment or answer
async function addDislikeButton(element) {
  // Check if button already exists
  if (element.querySelector('.dislike-button')) return;
  const userId = getUserId();
  let dislikeButton;
  let dislikeCount;
  let targetContainer;

  // For instructor answers, student answers, or notes
  if (element.matches('article[data-id="i_answer"]') || 
      element.matches('article[data-id="s_answer"]') ||
      element.matches('article#qaContentViewId.main[aria-label="note"]')) {
    const footer = element.querySelector('footer .col-auto');
    if (!footer) return;

    dislikeButton = document.createElement('button');
    dislikeButton.className = 'text-notrans btn btn-link dislike-button';
    dislikeButton.setAttribute('aria-label', 'mark this as unhelpful');
    
    // Set appropriate button text based on element type
    if (element.matches('article[data-id="i_answer"]')) {
      dislikeButton.innerHTML = '👎 not helpful';
    } else if (element.matches('article[data-id="s_answer"]')) {
      dislikeButton.innerHTML = '👎 not helpful';
    } else {
      dislikeButton.innerHTML = '👎 not useful';
    }
    
    dislikeCount = document.createElement('div');
    dislikeCount.className = 'd-inline-block ml-1 dislike-count';
    dislikeCount.setAttribute('aria-label', '0 dislikes');
    dislikeCount.textContent = '0';

    targetContainer = footer;
  } else {
    // For regular comments
    const actionsContainer = element.querySelector('.actions');
    if (!actionsContainer) return;

    dislikeButton = document.createElement('span');
    dislikeButton.className = 'dislike-button';
    dislikeButton.innerHTML = '👎';
    
    dislikeCount = document.createElement('span');
    dislikeCount.className = 'dislike-count';
    dislikeCount.textContent = '0';

    targetContainer = actionsContainer;
  }

  const commentId = generateCommentId(element);

  // Load existing dislike state from backend
  try {
    const response = await fetch(`${BACKEND_URL}/dislikes/${commentId}?userId=${userId}`);
    const data = await response.json();
    if (data.hasDisliked) {
      dislikeButton.classList.add('active');
    }
    dislikeCount.textContent = data.totalDislikes || '0';
  } catch (error) {
    console.error('Error loading dislike state:', error);
  }

  dislikeButton.addEventListener('click', async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: commentId,
          userId: userId,
          action: dislikeButton.classList.contains('active') ? 'remove' : 'add'
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('Error:', data.error);
        return;
      }
      
      // Update UI
      dislikeButton.classList.toggle('active');
      dislikeCount.textContent = data.totalDislikes;

    } catch (error) {
      console.error('Error updating dislike:', error);
    }
  });

  targetContainer.appendChild(dislikeButton);
  targetContainer.appendChild(dislikeCount);
}

// Function to add dislike buttons to all existing content
function addDislikeButtonsToExisting() {
  // console.log('Adding dislike buttons to existing content');
  
  // Use a Set to track elements we've processed
  const processedElements = new Set();
  
  // Handle instructor answers, student answers, and notes
  document.querySelectorAll('article[data-id="i_answer"], article[data-id="s_answer"], article#qaContentViewId.main[aria-label="note"]').forEach(element => {
    if (!processedElements.has(element)) {
      processedElements.add(element);
      addDislikeButton(element);
    }
  });
  
  // Then handle regular comments
  document.querySelectorAll('.comment:not(article[data-id="i_answer"]):not(article[data-id="s_answer"]):not(article#qaContentViewId)').forEach(element => {
    if (!processedElements.has(element)) {
      processedElements.add(element);
      addDislikeButton(element);
    }
  });
}

// Function to observe DOM changes and add dislike buttons to new comments
function observeComments() {
  // console.log('Setting up MutationObserver');
  
  // Use a Set to track elements we've processed
  const processedElements = new Set();
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check instructor answers, student answers, and notes
          node.querySelectorAll('article[data-id="i_answer"], article[data-id="s_answer"], article#qaContentViewId.main[aria-label="note"]').forEach(element => {
            if (!processedElements.has(element)) {
              processedElements.add(element);
              addDislikeButton(element);
            }
          });
          
          // Then check regular comments
          node.querySelectorAll('.comment:not(article[data-id="i_answer"]):not(article[data-id="s_answer"]):not(article#qaContentViewId)').forEach(element => {
            if (!processedElements.has(element)) {
              processedElements.add(element);
              addDislikeButton(element);
            }
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Track if observer is already set up
let observerInitialized = false;

// Initialize
function init() {
  // console.log('Initializing Piazza Dislikes extension');
  // Add buttons to existing content
  addDislikeButtonsToExisting();
  
  // Only set up observer once
  if (!observerInitialized) {
    observeComments();
    observerInitialized = true;
  }
}

// Set up a flag to track initialization
let hasInitialized = false;

// Function to ensure we only initialize once
function safeInit() {
  if (!hasInitialized) {
    hasInitialized = true;
    init();
  }
}

// Wait for page to load
if (document.readyState === 'loading') {
  // console.log('Document still loading, adding DOMContentLoaded listener');
  document.addEventListener('DOMContentLoaded', safeInit);
} else {
  // console.log('Document already loaded, initializing immediately');
  safeInit();
}

// Also add a delayed initialization since Piazza might load content dynamically
setTimeout(safeInit, 2000);
