import Header from "~/src/components/Header";
import Footer from "~/src/components/Footer";
import List from "~/src/components/List";
import AddRepo from "~/src/components/AddRepo";

export const Routes = [
    {
        name      : 'active',
        path      : '/active',
        components: {
            header : Header,
            content: List,
            footer : Footer,
        }
    },
    {
        name      : 'nothing',
        path      : '/nothing',
        components: {
            header : Header,
            content: AddRepo,
            footer : Footer
        }
    }
];