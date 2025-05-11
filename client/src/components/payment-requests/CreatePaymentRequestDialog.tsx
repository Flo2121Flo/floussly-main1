import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useUsers } from '../../hooks/useUsers';
import { useCreatePaymentRequest } from '../../hooks/useCreatePaymentRequest';
import { useSnackbar } from '../../hooks/useSnackbar';

interface CreatePaymentRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  receiverId: string;
  amount: number;
  currency: string;
  message?: string;
  expiresIn?: number;
}

const CURRENCIES = ['MAD', 'EUR', 'USD'];
const EXPIRY_OPTIONS = [
  { value: 24, label: '24 hours' },
  { value: 48, label: '48 hours' },
  { value: 72, label: '72 hours' },
  { value: 168, label: '1 week' },
];

export const CreatePaymentRequestDialog: React.FC<CreatePaymentRequestDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { createPaymentRequest, isLoading: isCreating } = useCreatePaymentRequest();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      amount: 0,
      currency: 'MAD',
      expiresIn: 24,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createPaymentRequest(data);
      onSuccess();
      handleClose();
    } catch (error) {
      showSnackbar(t('paymentRequests.create.error'), 'error');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{t('paymentRequests.create.title')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Controller
              name="receiverId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={users}
                  getOptionLabel={(option) => option.name}
                  loading={isLoadingUsers}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('paymentRequests.create.recipient')}
                      error={!!errors.receiverId}
                      helperText={errors.receiverId && t('common.required')}
                    />
                  )}
                  onChange={(_, value) => field.onChange(value?.id)}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="amount"
                control={control}
                rules={{
                  required: true,
                  min: { value: 0.01, message: t('common.minAmount') },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('paymentRequests.create.amount')}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="currency"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('paymentRequests.create.currency')}</InputLabel>
                    <Select {...field} label={t('paymentRequests.create.currency')}>
                      {CURRENCIES.map((currency) => (
                        <MenuItem key={currency} value={currency}>
                          {currency}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>

            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('paymentRequests.create.message')}
                  multiline
                  rows={3}
                />
              )}
            />

            <Controller
              name="expiresIn"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>{t('paymentRequests.create.expiry')}</InputLabel>
                  <Select {...field} label={t('paymentRequests.create.expiry')}>
                    {EXPIRY_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('common.cancel')}</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isCreating}
          >
            {t('paymentRequests.create.submit')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 