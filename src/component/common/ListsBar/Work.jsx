

function Work() {
    const WorkClick = () => {
        alert("work Tasks")
    }
    return (
        <>
            <button
                onClick={WorkClick}
                style={{ cursor: 'pointer', padding: '1px', border: '1px solid transparent' }}
                onMouseOver={(e) => e.target.style.background = '#3df088'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}

            > Work </button>
        </>
    )
}

export default Work;

