import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { ControlProps } from '../../../types';

export default function ImgList({ attributes = {} }: ControlProps) {
    const { MuiAttributes = {}, items = [], width = 500, height = 450, cols = 3, rowHeight = 164 } = attributes;

    return (
        <ImageList sx={{ width, height }} cols={cols} rowHeight={rowHeight} {...MuiAttributes}>
            {items.map((item: any) => (
                <ImageListItem key={item.img}>
                    <img
                        srcSet={`${item.img}?w=${rowHeight}&h=${rowHeight}&fit=crop&auto=format&dpr=2 2x`}
                        src={`${item.img}?w=${rowHeight}&h=${rowHeight}&fit=crop&auto=format`}
                        alt={item.title}
                        loading="lazy"
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
}
