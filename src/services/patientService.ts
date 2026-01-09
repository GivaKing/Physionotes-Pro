
import { supabase } from '../supabaseClient';
import { ClientData, VisitData, TherapistData } from '../types';

// Helper to sanitize data before sending to DB
const prepareTherapistPayload = (therapist: TherapistData) => {
    const t = (therapist || {}) as Partial<TherapistData>;
    return {
        ...t,
        softTissue: t.softTissue || '',
        testsNerve: t.testsNerve || '', 
        neuroScreening: t.neuroScreening || {}, 
        neuralTension: t.neuralTension || {}, 
        gaitDetails: t.gaitDetails || {}, 
        reasonTags: t.reasonTags || [],
        homeEx: t.homeEx || '',
        sessionGoals: t.sessionGoals || [],
        postureGrid: t.postureGrid || {},
        rom: t.rom || {},
        mmt: t.mmt || {},
        sttt: t.sttt || {},
        jointMobility: t.jointMobility || {}, // Support new object structure
        // Ensure legacy fields don't break insert
        palpation: t.softTissue || '', 
        neuroTension: t.testsNerve || '',
        reasoningTags: t.reasonTags || [],
        homeExercise: t.homeEx || ''
    };
};

const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const ageDifMs = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const PatientService = {
    // --- Patient Operations ---

    async fetchPatients(userId: string) {
        const { data, error } = await supabase
            .from('patients')
            .select(`
                id, created_at, raw_client,
                visit!visit_patient_cascade_link ( id, created_at, vas_now, vas_max, raw_visit, raw_therapist )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async createPatient(userId: string, clientData: ClientData) {
        const { data, error } = await supabase.from('patients').insert({
            user_id: userId,
            name: clientData.name,
            age: calculateAge(clientData.dob),
            gender: clientData.gender,
            job: clientData.job,
            main_complaint: clientData.chiefComplaint,
            raw_client: clientData
        }).select().single();

        if (error) throw error;
        return data;
    },

    async updatePatient(id: string, clientData: ClientData) {
        const { error } = await supabase.from('patients').update({
            name: clientData.name,
            age: calculateAge(clientData.dob),
            gender: clientData.gender,
            job: clientData.job,
            main_complaint: clientData.chiefComplaint,
            raw_client: clientData
        }).eq('id', id);

        if (error) throw error;
    },

    async deletePatient(id: string, userId: string) {
        await supabase.from('visit').delete().eq('patient_id', id).eq('user_id', userId);
        const { error } = await supabase.from('patients').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
    },

    // --- Visit Operations ---

    async createVisit(userId: string, caseId: string, visit: VisitData, therapist: TherapistData) {
        const payloadTherapist = prepareTherapistPayload(therapist);
        const { error } = await supabase.from('visit').insert({
            user_id: userId,
            patient_id: caseId,
            vas_now: visit.vasNow || 0,
            vas_max: visit.vasMax || 0,
            raw_visit: visit,
            raw_therapist: payloadTherapist
        });
        if (error) throw error;
    },

    async updateVisit(visitId: string, visit: VisitData, therapist: TherapistData) {
        const payloadTherapist = prepareTherapistPayload(therapist);
        const { error } = await supabase.from('visit').update({
            vas_now: visit.vasNow || 0,
            vas_max: visit.vasMax || 0,
            raw_visit: visit,
            raw_therapist: payloadTherapist
        }).eq('id', visitId);
        if (error) throw error;
    },

    async deleteVisit(visitId: string) {
        const { error } = await supabase.from('visit').delete().eq('id', visitId);
        if (error) throw error;
    },

    async importPatientData(userId: string, caseData: any) {
        if (!caseData.client || !caseData.client.name) {
             throw new Error("無效的個案資料：缺少姓名。");
        }

        // 直接使用原始姓名，不再添加 (Import)
        const name = caseData.client.name;

        const { data: newPatient, error: pError } = await supabase.from('patients').insert({
            user_id: userId,
            name: name,
            age: calculateAge(caseData.client.dob),
            gender: caseData.client.gender || '',
            job: caseData.client.job || '',
            main_complaint: caseData.client.chiefComplaint || '',
            raw_client: { ...caseData.client, name } 
        }).select().single();

        if (pError) throw pError;
        
        if (caseData.records && Array.isArray(caseData.records) && caseData.records.length > 0) {
            const visitsToInsert = caseData.records.map((r: any) => {
                const visitDate = r.visitDate ? new Date(r.visitDate) : new Date();
                const safeDate = isNaN(visitDate.getTime()) ? new Date() : visitDate;

                return {
                    user_id: userId,
                    patient_id: newPatient.id,
                    vas_now: r.visit?.vasNow ?? 0,
                    vas_max: r.visit?.vasMax ?? 0,
                    raw_visit: r.visit || {},
                    raw_therapist: prepareTherapistPayload(r.therapist || {}),
                    created_at: safeDate.toISOString()
                };
            });

            const { error: vError } = await supabase.from('visit').insert(visitsToInsert);
            if (vError) throw vError;
        }
    }
};
