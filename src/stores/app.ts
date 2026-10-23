import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useAppStore = defineStore('app', () => {
    const sidebarOpen = ref(false)
    const notification = ref('')

    function notify(message: string) {
        notification.value = message;
        window.setTimeout(() => {
            if (notification.value === message) notification.value = ''
        }, 3500)
    }

    return {sidebarOpen, notification, notify}
})