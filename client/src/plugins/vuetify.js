//*MDI ICON / FONTS
import '@mdi/font/css/materialdesignicons.css'
//* VUETIFY
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const vuetify = createVuetify({
    defaults: {
        VBtn: {
            rounded: 'pill',
            class: 'text-none'
        },
        VTextField: {
            density: 'compact',
            variant: 'outlined',
        },
        VTextarea: {
            density: 'compact',
            variant: 'outlined',
        },
        VFileInput: {
            density: 'compact',
            variant: 'outlined',
        },
    }
})


export default vuetify;