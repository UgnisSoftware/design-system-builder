import * as React from 'react'
export const BoxIcon = () => <i className="material-icons">layers</i>
export const IfIcon = () => (
    <i className="material-icons" style={{ transform: 'rotate(90deg)' }}>
        call_split
    </i>
)
export const LinkIcon = () => <i className="material-icons">link</i>
export const NumberIcon = () => <i className="material-icons">looks_one</i>
export const ListIcon = () => <i className="material-icons">view_list</i>
export const InputIcon = () => <i className="material-icons">input</i>
export const TextIcon = () => <i className="material-icons">title</i>
export const DeleteIcon = () => <i className="material-icons">delete_forever</i>
export const ClearIcon = () => (
    <i className="material-icons" data-trashcan={true}>
        clear
    </i>
)
export const AddCircleIcon = () => <i className="material-icons">add_circle</i>
export const PauseIcon = () => <i className="material-icons">pause</i>
export const PlayIcon = () => <i className="material-icons">play_arrow</i>
export const FullScreenIcon = () => <i className="material-icons">fullscreen</i>
export const UgnisIcon = () => <img src="/images/ugn.png" width="18" height="18" />
export const ImageIcon = () => <i className="material-icons">crop_original</i>
export const AppIcon = () => (
    <i className="material-icons" style={{ fontSize: '18px' }}>
        description
    </i>
)

interface Props {
    rotate?: boolean
}
export const ArrowIcon = ({ rotate }: Props) => (
    <i
        className="material-icons"
        data-closearrow={true}
        style={{
            transition: 'all 0.2s',
            transform: rotate ? 'rotate(-90deg)' : 'rotate(0deg)',
            cursor: 'pointer',
        }}
    >
        arrow_drop_down
    </i>
)
