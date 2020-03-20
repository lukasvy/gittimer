import ActiveList from "./components/ActiveList";
import Empty from "./components/Empty";

export const Routes = [
    {
        name     : 'active',
        path     : '/active',
        component: ActiveList
    },
    {
        name     : 'nothing',
        path     : '/nothing',
        component: Empty
    }
]