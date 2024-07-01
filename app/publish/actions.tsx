'use server'
import { redirect } from 'next/navigation'
import { createClient } from "@/utils/supabase/server"
import { getAPIURL } from '@/lib/utils'
function analyzeGitRepo(url: string) {
    try{
    fetch(`${getAPIURL()}?git_url=${url}`)
    }
    catch(e){
        console.log("Error analyzing git repo")
    }
}
export async function createPayment(formData: any) {
    // const supabase = createClient();
    // const { data, error } = await supabase.from('offers').insert([
    //     // convert all entries to string
    //     {
    //         url: formData.url,
    //         description: formData.description,
    //         from: formData.date.from,
    //         to: formData.date.to,
    //         budget: formData.budget,
    //         keywords: formData.keywords.map((keyword: { label: string; }) => (keyword.label)).join(','), // convert array to string
    //         payment_status: 'pending'
    //     }
    // ]).select()
    // if (error) {
    //     redirect(`/publish/error`)
    // }

    // if (data) {
        // Create payment intent
        redirect(`/publish/payment`)
    // }
    // redirect(`/publish/error`)
}

export async function publishNewKeyword(keyword: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('keywords').insert([
        {
            label: keyword
        }
    ]).select()
    return { data, error }
}

export async function registerOffer(data: { url: any; description: any; date: { from: any; to: any; }; budget: any; keywords: { label: string; }[]; type: string; }) {
    const supabase = createClient()
    const {data:userData,error:userError} = await supabase.auth.getUser()
    const { data: offerData, error } = await supabase.from('offers').insert([
        {
            url: data.url,
            description: data.description,
            from: data.date.from,
            to: data.date.to,
            budget: data.budget,
            keywords: data.keywords.map((keyword: { label: string; }) => (keyword.label)).join(','), // convert array to string
            payment_status: 'pending',
            type: data.type,
            owner: userData.user?.id,
        }
    ]).select()
    if (offerData && offerData[0]) {
        console.log('SUCCESSFUL REGISTER', data)
        analyzeGitRepo(data.url)
        return {data:offerData[0].id,error:error}
    }
    console.log('ERROR REGISTER', error)
    return {data:null,error:error}
}
export async function updateOffer(id: number, data: { url: any; description: any; date: { from: any; to: any; }; budget: any; keywords: { label: string; }[]; type:string;}) {
    const supabase = createClient()
    const {data:userData,error:userError} = await supabase.auth.getUser()
    const { data: offerData, error } = await supabase.from('offers').update(
        {
            url: data.url,
            description: data.description,
            from: data.date.from,
            to: data.date.to,
            budget: data.budget,
            keywords: data.keywords.map((keyword: { label: string; }) => (keyword.label)).join(','), // convert array to string
            type: data.type,
            owner: userData.user?.id,
        }
    ).eq('id',id).select()
    if (offerData && offerData[0]) {
        console.log('SUCCESSFUL UPDATING', offerData)
        analyzeGitRepo(data.url)
        return {data:offerData[0].id,error:error}
    }
    console.log('ERROR UPDATING', error)
    return {data:null,error:error}
}