/**
 * Toast Notification System
 * Production-grade notification system for user feedback
 */

export class NotificationManager {
  constructor() {
    this.container = null;
    this.notifications = new Map();
    this.init();
  }

  init() {
    // Create notification container
    this.container = document.createElement('div');
    this.container.className = 'polotno-notifications';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(this.container);

    // Add styles
    this.injectStyles();
  }

  injectStyles() {
    if (document.getElementById('polotno-notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'polotno-notification-styles';
    style.textContent = `
      .polotno-notifications {
        position: fixed;
        top: 70px;
        right: 20px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        pointer-events: none;
      }

      @media (max-width: 500px) {
        .polotno-notifications {
          top: 60px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }

      .polotno-notification {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        pointer-events: auto;
        animation: slideIn 0.3s ease-out;
        border-left: 4px solid;
      }

      .polotno-notification.success {
        border-left-color: #0f9960;
      }

      .polotno-notification.error {
        border-left-color: #db3737;
      }

      .polotno-notification.warning {
        border-left-color: #f29d49;
      }

      .polotno-notification.info {
        border-left-color: #2b95d6;
      }

      .polotno-notification-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .polotno-notification.success .polotno-notification-icon {
        color: #0f9960;
      }

      .polotno-notification.error .polotno-notification-icon {
        color: #db3737;
      }

      .polotno-notification.warning .polotno-notification-icon {
        color: #f29d49;
      }

      .polotno-notification.info .polotno-notification-icon {
        color: #2b95d6;
      }

      .polotno-notification-content {
        flex: 1;
        min-width: 0;
      }

      .polotno-notification-title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
        color: #182026;
      }

      .polotno-notification-message {
        font-size: 13px;
        color: #5c7080;
        line-height: 1.4;
      }

      .polotno-notification-close {
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: #5c7080;
        opacity: 0.6;
        transition: opacity 0.2s;
      }

      .polotno-notification-close:hover {
        opacity: 1;
      }

      .polotno-notification.removing {
        animation: slideOut 0.3s ease-out forwards;
      }

      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }

      .polotno-notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 0 0 8px 8px;
        overflow: hidden;
      }

      .polotno-notification-progress-bar {
        height: 100%;
        background: currentColor;
        transition: width 0.1s linear;
      }
    `;
    document.head.appendChild(style);
  }

  show(options) {
    const {
      type = 'info',
      title,
      message,
      duration = 5000,
      dismissible = true,
    } = options;

    const id = Date.now() + Math.random();
    const notification = this.createNotification(id, type, title, message, duration, dismissible);

    this.container.appendChild(notification);
    this.notifications.set(id, notification);

    if (duration > 0) {
      setTimeout(() => this.hide(id), duration);
    }

    return id;
  }

  createNotification(id, type, title, message, duration, dismissible) {
    const notification = document.createElement('div');
    notification.className = `polotno-notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    const icons = {
      success: `<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`,
      error: `<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`,
      warning: `<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`,
      info: `<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>`,
    };

    notification.innerHTML = `
      <div class="polotno-notification-icon">${icons[type]}</div>
      <div class="polotno-notification-content">
        ${title ? `<div class="polotno-notification-title">${title}</div>` : ''}
        <div class="polotno-notification-message">${message}</div>
      </div>
      ${dismissible ? `
        <button class="polotno-notification-close" aria-label="Close notification">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      ` : ''}
      ${duration > 0 ? `
        <div class="polotno-notification-progress">
          <div class="polotno-notification-progress-bar" style="width: 100%"></div>
        </div>
      ` : ''}
    `;

    if (dismissible) {
      notification.querySelector('.polotno-notification-close').addEventListener('click', () => {
        this.hide(id);
      });
    }

    if (duration > 0) {
      const progressBar = notification.querySelector('.polotno-notification-progress-bar');
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 100;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        if (progressBar) {
          progressBar.style.width = remaining + '%';
        }
        if (elapsed >= duration) {
          clearInterval(interval);
        }
      }, 100);
    }

    return notification;
  }

  hide(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.classList.add('removing');
    setTimeout(() => {
      notification.remove();
      this.notifications.delete(id);
    }, 300);
  }

  success(message, title) {
    return this.show({ type: 'success', title, message });
  }

  error(message, title) {
    return this.show({ type: 'error', title, message, duration: 7000 });
  }

  warning(message, title) {
    return this.show({ type: 'warning', title, message, duration: 6000 });
  }

  info(message, title) {
    return this.show({ type: 'info', title, message });
  }

  clearAll() {
    this.notifications.forEach((_, id) => this.hide(id));
  }
}

// Create global instance
export const notifications = new NotificationManager();

// Export convenience functions
export const showSuccess = (message, title) => notifications.success(message, title);
export const showError = (message, title) => notifications.error(message, title);
export const showWarning = (message, title) => notifications.warning(message, title);
export const showInfo = (message, title) => notifications.info(message, title);

export default notifications;
