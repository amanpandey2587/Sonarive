import { Navbar } from "@/components/ui/layout/navbar";
import { Footer } from "@/components/ui/layout/footer";

export default function MainLayout({
    children,
}:{
    children:React.ReactNode
}){
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar/>
            <div className="flex-grow">{children}</div>
            <Footer/>
        </div>
    )
}