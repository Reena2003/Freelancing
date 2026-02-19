import './Card.css';

const Card = ({
    children,
    variant = 'default',
    padding = 'md',
    hover = false,
    className = '',
    onClick
}) => {
    const classes = [
        'card',
        `card-${variant}`,
        `card-p-${padding}`,
        hover && 'card-hover',
        onClick && 'card-clickable',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick}>
            {children}
        </div>
    );
};

export default Card;
