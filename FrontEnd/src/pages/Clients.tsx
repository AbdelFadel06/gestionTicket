const Clients = () => {
    return (
        <>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="bg-muted/50 aspect-video rounded-xl">stat client</div>
                <div className="bg-red-400/50 aspect-video rounded-xl">stat2 client</div>
                <div className="bg-muted/50 aspect-video rounded-xl">stat3 client</div>
            </div>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">list client</div>
        </>
    )
}

export default Clients
