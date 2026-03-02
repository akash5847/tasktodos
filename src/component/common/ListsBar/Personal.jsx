

function Personal() {
    const PersonalClick = () => {
        alert("Personal Tasks")
    }
    return (
        <>
            <button
                onClick={PersonalClick}
                style={{ cursor: 'pointer', padding: '1px', border: '1px solid transparent' }}
                onMouseOver={(e) => e.target.style.background = '#3df088'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}

            > Personal </button>
        </>
    )
}

export default Personal;

