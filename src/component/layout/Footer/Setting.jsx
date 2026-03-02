


function Setting() {
    const SettingClick = () => {
        alert("Today Tasks")
    }

    return (
        <>
            <button
                onClick={SettingClick}
                style={{ cursor: 'pointer', padding: '1px', border: '1px solid transparent' }}
                onMouseOver={(e) => e.target.style.background = '#3df088'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}

            > Setting </button>
        </>
    )
}

export default Setting;

