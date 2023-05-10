/* eslint-disable react/prop-types */
import { useState, useImperativeHandle, useCallback, forwardRef, Ref, useMemo } from 'react'
import { useForm } from "react-hook-form";
import { useAuthenticatedGetRepositorySecrets, useAuthenticatedPatchRepositorySecret } from 'services/requests/repository'
import { toast } from 'react-toastify';
import {
    Card,
    CardHeader,
    CardContent,
    Box,
    Typography,
    Grid,
    TextField,
    IconButton,
    Tooltip
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';


interface SecretsCardProps {
    repositoryId: number | null;
}


/* eslint-disable react/prop-types */
const SecretsCard = (props: SecretsCardProps, ref: Ref<any>) => {
    const filledDefaultValue = '******'
    const { repositoryId } = props;
    const { register, getValues, resetField } = useForm();
    const [currrentEdittingSecretId, setCurrrentEdittingSecretId] = useState<number | null>(null)

    useImperativeHandle(ref, () => ({
        ...ref
    }));

    const {
        data: secrets,
        mutate: refreshSecrets,
    } = useAuthenticatedGetRepositorySecrets({ repositoryId: repositoryId?.toString() ?? '' })


    const patchRepository = useAuthenticatedPatchRepositorySecret()

    const handleEditSecret = useCallback((e: any) => {
        e.preventDefault();
        const selectedSecretId = e.currentTarget.value
        setCurrrentEdittingSecretId(selectedSecretId)
    }, [])

    const handleSaveSecret = useCallback(async(e: any) => {
        e.preventDefault();
        const selectedSecretId = e.currentTarget.value

        if (!repositoryId) {
            toast.error('Repository not selected.')
            return
        }

        if (e.currentTarget.ariaLabel === 'clear'){
            const payload = {
                value: null
            }
            patchRepository({
                repositoryId: repositoryId.toString(),
                secretId: selectedSecretId as string,
                payload: payload
            }).then((response) => {
                toast.success('Secret updated.')
                refreshSecrets()
                resetField(selectedSecretId?.toString(), { keepTouched : false})
                setCurrrentEdittingSecretId(null) 
            }).catch((err) => {
                toast.error('Error while updating secrets')
            })
            return
        }

        const formValue = getValues(selectedSecretId?.toString())
        if (!formValue){
            toast.warning("Please enter a valid value for the secret.")
            return
        }
        if (formValue === filledDefaultValue) {
            toast.warning('Please enter a new value for the secret.')
            return
        }
        
        const payload = {
            value: formValue,
        }
        patchRepository({
            repositoryId: repositoryId.toString(),
            secretId: selectedSecretId as string,
            payload: payload
        }).then((response)=>{
            toast.success('Secret updated')
            refreshSecrets()
            setCurrrentEdittingSecretId(null)
        }).catch((err) => {
            console.log(err)
            toast.error('Error while updating secret.')
        })

    }, [getValues, repositoryId, patchRepository, refreshSecrets, resetField])

    const listItems = useMemo(() => {
        const auxListItems = secrets && secrets?.length > 0 ? secrets?.map((secret, index) => (
            <Grid item xs={12} key={index} container spacing={2}>
                <Grid item xs={7} sm={8} md={10}>
                    <TextField
                        InputLabelProps={{ shrink: true }}
                        autoFocus
                        id={`${repositoryId}-${secret.name}`}
                        label={`${secret.name}`}
                        disabled={currrentEdittingSecretId?.toString() !== secret.id.toString()}
                        defaultValue={secret.is_filled ? filledDefaultValue : ''}
                        type="password"
                        fullWidth
                        {...register(`${secret.id}`)}
                    />
                </Grid>
                <Grid item xs={5} sm={4} md={2}>
                    {
                        currrentEdittingSecretId?.toString() === secret.id.toString() ? (
                            <div>
                            <Tooltip title="Save">
                                <IconButton aria-label="save" value={secret.id} onClick={handleSaveSecret}>
                                    <SaveAltIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Clear">
                                <IconButton aria-label="clear" value={secret.id} onClick={handleSaveSecret} >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                                    <IconButton aria-label="cancel" onClick={() => setCurrrentEdittingSecretId(null)}>
                                    <CancelIcon/>
                                </IconButton>
                            </Tooltip>
                            </div>
                        ) : (
                            <Tooltip title="Edit">
                                <IconButton aria-label="edit" value={secret.id} onClick={handleEditSecret}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        )
                    }
                </Grid>
            </Grid>
        )) : (
            <Grid item xs={12}>
                {
                    repositoryId === null ? (
                        <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                            No repository selected.
                        </Typography>
                    ) : (
                        <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                            This repository has no secrets.
                        </Typography>
                    )
                }
            </Grid>
        )
        return auxListItems
    }, [secrets, repositoryId, currrentEdittingSecretId, handleEditSecret, handleSaveSecret, register])

    return (
        <Card variant='outlined'>
            <CardHeader
                title='Repository Secrets'
                titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
                <Box>
                    <Typography variant='body1'>
                        Secrets are environment variables that are encrypted and injected to the operator container based on the operator SecretsModel.
                        Anyone with access to this workspace can use these secrets for running operators.
                    </Typography>
                    <form>
                        <Grid container spacing={2} sx={{ marginTop: '15px' }}>
                            {listItems}
                        </Grid>
                    </form>
                </Box>
            </CardContent>
        </Card>
    );
}

export default forwardRef(SecretsCard);