export default props => {
    const color = props.colorScheme === 'success' ? 'text-[#18794e] bg-[#ddf3e4] dark:text-[#4cc38a] dark:bg-[#113123]' :
        props.colorScheme === 'warning' ? 'text-[#ad5700] bg-[#ffecbc] dark:text-[#f1a10d] dark:bg-[#3f2200]' :
        'text-[#11181c] bg-[#eceef0] dark:text-[#ecedee] dark:bg-[#26292b]';
    return (
        <div class={'inline-block border border-transparent rounded py-0.5 px-1 text-xs font-bold tracking-wide align-middle '+color}>
            {props.children}
        </div>
    );
};