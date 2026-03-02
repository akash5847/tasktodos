

function StickyWall() {
    const StickyWallClicked = () => {
        alert(" StickyWalls ")
    }
    return (
        <>
            <button
                onClick={StickyWallClicked}
                style={{ cursor: 'pointer', padding: '1px', border: '1px solid transparent' }}
                onMouseOver={(e) => e.target.style.background = '#3df088'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}

            > StickyWall </button>
        </>
    )
}

export default StickyWall;

