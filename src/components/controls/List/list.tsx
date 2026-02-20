import { List as MuiList, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Icon } from '@mui/material';
import { ControlProps } from '../../../types';

export default function List({ attributes = {} }: ControlProps) {
    const { MuiAttributes = {}, items = [] } = attributes;

    return (
        <MuiList {...MuiAttributes}>
            {items.map((item: any, index: number) => (
                <ListItem key={index} {...item.MuiListItemAttributes}>
                    {item.icon && (
                        <ListItemIcon>
                            <Icon>{item.icon}</Icon>
                        </ListItemIcon>
                    )}
                    <ListItemText
                        primary={item.primary}
                        secondary={item.secondary}
                        {...item.MuiListItemTextAttributes}
                    />
                </ListItem>
            ))}
        </MuiList>
    );
}
