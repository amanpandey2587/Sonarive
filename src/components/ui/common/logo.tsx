import { Stethoscope } from "lucide-react";
import Link from 'next/link'

export function Logo(){
    return(
        <Link href='/' className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
            <Stethoscope className="h-8 w-8"/>
        <span>MediScan</span>
        </Link>
    )
}